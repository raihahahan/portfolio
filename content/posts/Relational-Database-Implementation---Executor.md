---
title: Relational Database Implementation - Executor Engine
published_at: 2026-01-05T16:00:00.000Z
read_time: 3
prev_post: content/posts/Relational-Database-Implementation---Model-Layer.md
next_post: ''
excerpt: The "Volcano execution model"
---

> This blog is part of a series of posts where I document how I built a relational database from scratch in C++, following concepts from Postgresql and sqlite ([start here](https://mraihan.dev/blog/Implementing-a-relational-database-from-scratch---Storage-Layer)).\
> \
> **Summary of this post:**\
> \
> \
> **Github:** [https://github.com/raihahahan/cpp-relational-db](https://github.com/raihahahan/cpp-relational-db)

# Recap

So far, the storage layer of the database engine is done.

1. **Disk manager:** Handles raw disk page I/O of 8192 bytes each.
2. **Buffer manager:** Acts as the cache layer to store working pages in-memory.
3. **Slotted Page:** Determines the layout of data within a single page.
4. **Access layer:** Provides an access path for the database to retrieve data. This can be heap files, B+-trees, hash index etc. As of the time of writing, only heap files access has been implemented. A heap file is a singly-linked list of pages to store records (rows) in a single relation (table). This allows for sequential scan (page by page, slot by slot within a slotted page).
5. **Catalog Layer:** This is responsible for metadata information of the database (what tables, attributes, types exist). This info is stored as tables themselves. (e.g tables\_catalog, attributes\_catalog, types\_catalog). Initial bootstrapping is done here to populate the initial catalog data.
6. **Model Layer:** Handles managing user tables and schemas of these user tables. It is similar to the catalog layer, with the difference that catalog layer has hardcoded schema, so there exists compile-time optimisations in the catalog layer, whereas user tables are more runtime-dynamic.

\
With that, a simple database program can be created (without lookups yet).

```cpp
DiskManager* dm = new DiskManager("database.db");
BufferManager* bm = new BufferManager(CLOCK, dm);
Catalog* cat = new Catalog(bm, dm);

// initialise catalog
cat->Init();

// initialise table manager
TableManager manager{cat};

// create table
// first need to create schema
std::vector<catalog::RawColumnInfo> schema = {
    { "id", catalog::INT_TYPE, 1 },
    { "name", catalog::TEXT_TYPE, 2}
};

// table operations
auto table_id = manager.CreateTable("students", schema);
auto students_table = manager.OpenTable("students");
std::vector<Value> row = { uint32_t{1}, "Raihan" };
auto rid = students_table.Insert(row);
```

# Executor Engine

In a full database pipeline, query execution is only the final stage. A SQL query first goes through the parser, which turns text into an abstract syntax tree. That tree is then transformed into a logical plan, describing what the query wants to do in a relational sense (selection, projection, joins). The optimiser rewrites this logical plan and chooses an efficient strategy, eventually producing a physical plan made up of concrete operators like sequential scans, filters, and projections. The executor’s job begins only after all of this is done.\
\
Thus, the executor engine is responsible for evaluating this query plan and producing result tuples. It consumes relations and operators, executes them using the [iterator (Volcano) model](https://paperhub.s3.amazonaws.com/dace52a42c07f7f8348b08dc2b186061.pdf), and materialises results row by row.

# Volcano iterator model

Operators are the basic building blocks for our queries (e.g. Sequential Scan, Filter, Limit, Join etc. are examples of operators). The volcano model is a simple yet powerful design pattern that ensures each operator implements the same interface:

1. `Open()`: Initialise internal state. (e.g Sequential Scan initialises the iterator it needs for the relation it is scanning)
2. `Next()`: Produce the next tuple.  (e.g Sequential Scan returns iterator->next)
3. `Close()`: Release resources

\
When an operator asks for the next tuple, it pulls from its child, which in turn pulls from its own child, and so on, until a leaf operator (such as a table scan) produces a row from storage. That row then flows back up the tree, being transformed step by step (filtered, projected, or limited) until it reaches the root. Each operator only sees one row at a time and is completely unaware of the larger query structure.\
\
This pull-based, lazy-evaulation design has a powerful consequence: operators are decoupled from their inputs. A filter does not care whether rows come from a table scan, a join, or a subquery. A projection does not know how its input was produced. As long as the child obeys the iterator interface, the parent operator simply repeatedly calls `Next()` on its child. This uniformity makes the execution engine easy to extend and reason about, since new operators can be added without changing existing ones.

# Operators

As mentioned above, operators are the building blocks for queries. Operators are stateful as they remember where they left off between calls to `Next()`.

## Leaf vs non-leaf operators

There are two broad categories of operators.

### Leaf Operators

Leaf operators have no child operators. They read data directly from a relation and serve as the entry point into execution\
\
Example: sequential scan

### Non-Leaf Operators

Non-leaf operators have children (e.g. two for joins, one for filter). Their main responsibility is to transform tuples coming from the child and do not access storage directly. This separation keeps higher-level operators storage-agnostic.\
\
Examples: filter, projection, limit\


## SeqScanOp

SeqScanOp is the simplest operator and the only one that touches storage.\
\
Responsibilities:

* iterate through all records in a relation
* decode physical records into logical tuples
* return one tuple per `Next()` call

\
It takes a `Relation&` instead of a child operator because it is the source of data. Thus, table scans are leaf nodes in the execution tree.\
\
**Implementation**

```cpp
SeqScanOp::SeqScanOp(model::Relation& rel)
        : _rel{rel} {};

void SeqScanOp::Open() {
    _iter = _rel.Begin();
}

std::optional<Tuple> SeqScanOp::Next() {
    if (!_iter.HasNext()) return std::nullopt;
    return _rel.Decode(_iter.Next());
}

void SeqScanOp::Close() {}
```

\
**Example Usage**

```cpp
auto table = db.table_mgr->OpenTable("students");
table->Insert({Value{1}, Value{"Alice"}});
table->Insert({Value{2}, Value{"Bob"}});

executor::SeqScanOp scan{*table};
scan.Open();
auto t1 = scan.Next();
ASSERT_TRUE(t1.has_value());

auto t2 = scan.Next();
ASSERT_TRUE(t2.has_value());
EXPECT_FALSE(scan.Next().has_value());

scan.Close();
```

## FilterOp

FilterOp applies a predicate to incoming tuples.\
\
Responsibilities:

* pull tuples from its child
* evaluate a predicate
* emit only tuples that satisfy the condition

\
Internally, `Next()` usually contains a loop:

* fetch tuple from child
* test predicate
* skip until a match is found or child is exhausted

\
**Implementation**

```cpp
FilterOp::FilterOp(
      std::unique_ptr<Operator> child, Predicate pred) :
          _child{std::move(child)}, 
          _pred{std::move(pred)} {};

void FilterOp::Open() {
    _child->Open();
}

std::optional<Tuple> FilterOp::Next() {
    while (true) {
        auto tup = _child->Next();
        if (!tup) return std::nullopt;
        if (_pred.Evaluate(*tup)) return tup;
    }
}

void FilterOp::Close() {
    _child->Close();
}
```

\
**Example Usage**

```cpp
auto table = db.table_mgr->OpenTable("students");
table->Insert({Value{1}, Value{"Alice"}});
table->Insert({Value{2}, Value{"Bob"}});
table->Insert({Value{3}, Value{"Carol"}});

// compose scan within a filter
auto scan = executor::SeqScanOp(*table);
executor::FilterOp filter{
      std::make_unique<executor::SeqScanOp>(scan), 
      [](const common::Tuple& t) {
          return std::get<uint32_t>(t.GetValues()[0]) >= 2;
      }
};

filter.Open();
auto t1 = filter.Next();
ASSERT_TRUE(t1.has_value());
EXPECT_EQ(std::get<uint32_t>(t1->GetValues()[0]), 2);

auto t2 = filter.Next();
ASSERT_TRUE(t2.has_value());
EXPECT_EQ(std::get<uint32_t>(t2->GetValues()[0]), 3);
EXPECT_FALSE(filter.Next().has_value());

filter.Close();
```

## ProjectionOp

ProjectionOp reshapes tuples.\
\
Responsibilities:

* select a subset of columns from the input tuple
* construct a new output tuple
* associate it with a new schema

\
Projection is where schema transformation happens. The output schema is passed explicitly and shared immutably. This avoids hidden coupling between operators and keeps tuple interpretation explicit.\
\
**Implementation**

```cpp
ProjectionOp::ProjectionOp(
          std::unique_ptr<Operator> child,
          std::unordered_set<uint16_t> col_pos,
          std::shared_ptr<const common::Schema> out_schema) : 
              _child{std::move(child)}, 
              _col_pos{std::move(col_pos)},
              _out_schema{std::move(out_schema)} {};

void ProjectionOp::Open() {
    _child->Open();
}

std::optional<Tuple> ProjectionOp::Next() {
    auto tup = _child->Next();
    if (!tup) return std::nullopt;
    return Project(*tup);
}

void ProjectionOp::Close() {
    _child->Close();
}
```

\
**Example Usage**

```cpp
auto table = db.table_mgr->OpenTable("students");
table->Insert({Value{1}, Value{"Alice"}});

auto scan = executor::SeqScanOp(*table);
std::unordered_set<uint16_t> cols = {2}; // project name only
std::vector<ColumnInfo> out_schema;
out_schema.emplace_back(
        table_id, 
        schema[1].col_name, 
        schema[1].type_id, 
        schema[1].ordinal_position);

// compose scan within projection
executor::ProjectionOp proj{
    std::make_unique<executor::SeqScanOp>(scan),
    cols,
    std::make_shared<const common::Schema>(out_schema)
};

proj.Open();

auto t = proj.Next();
ASSERT_TRUE(t.has_value());
ASSERT_EQ(t->GetValues().size(), 1);
EXPECT_EQ(std::get<std::string>(t->GetValues()[0]), "Alice");
EXPECT_FALSE(proj.Next().has_value());

proj.Close();
```

## LimitOp

LimitOp enforces a row limit.\
\
Responsibilities:

* count how many tuples have been emitted
* stop execution once the limit is reached

\
This operator is short-circuiting. Once the limit is hit:

* `Next()` immediately returns `std::nullopt`
* parent operators stop pulling
* downstream operators are never called again

\
**Implementation**

```cpp
LimitOp::LimitOp(
      std::unique_ptr<Operator> child, size_t limit) 
        : _child{std::move(child)}, 
          _limit{limit}, 
          _produced{0} {};
            
void LimitOp::Open() {
    _produced = 0;
    _child->Open();
}

std::optional<Tuple> LimitOp::Next() {
    if (_produced >= _limit) return std::nullopt;
  
    auto tup = _child->Next();
    if (!tup) return std::nullopt;

    ++_produced;
    return tup;
}

void LimitOp::Close() {
    _child->Close();
}
```

\
**Example Usage**

```cpp
auto table = db.table_mgr->OpenTable("students");
table->Insert({Value{1}, Value{"Alice"}});
table->Insert({Value{2}, Value{"Bob"}});
table->Insert({Value{3}, Value{"Carol"}});

auto scan = std::make_unique<executor::SeqScanOp>(*table);
executor::LimitOp limit{std::move(scan), 2};

limit.Open();

auto t1 = limit.Next();
ASSERT_TRUE(t1.has_value());
EXPECT_EQ(std::get<uint32_t>(t1->GetValues()[0]), 1);

auto t2 = limit.Next();
ASSERT_TRUE(t2.has_value());
EXPECT_EQ(std::get<uint32_t>(t2->GetValues()[0]), 2);
EXPECT_FALSE(limit.Next().has_value());

limit.Close();
```

## Operator Composition

Operators are composed bottom-up to form a physical execution plan.\
\
**Example query:**

```pgsql
SELECT name
FROM students
WHERE id >= 2
LIMIT 1;
```

**Corresponding operator tree:**

```
Limit
  |
Projection
  |
Filter
  |
SeqScan
```

Each operator owns its child via `std::unique_ptr`, has no knowledge of the full plan and only interacts with its immediate child.

```cpp
auto scan = std::make_unique<SeqScanOp>(*table);

auto filter = std::make_unique<FilterOp>(
  std::move(scan), [](Tuple& t) {
    return std::get<uint32_t>(t.getValues()[0]) >= 2;
  }
);

auto proj = std::make_unique<ProjectionOp>(
  std::move(filter),
  cols_to_project,
  std::make_shared<const Schema>(out_schema)
);

auto limit = std::make_unique<LimitOp(
  std::move(proj), 1
);

// executor operator tree with Executor class
// (explained below)
Executor exec{std::move(limit)};
exec.Execute();
```

## The Executor class

The Executor is a thin orchestration layer. Its responsibilities are simple:

* call `Open()` on the root operator
* repeatedly call `Next()`
* optionally collect tuples
* call `Close()` at the end

\
There are two execution modes:

* fire-and-forget execution (e.g. future INSERT, DELETE)
* collecting results (used for SELECT)

```cpp
void Executor::Execute() {
    _plan->Open();
    while (true) {
        if (!_plan->Next()) break;
    }
    _plan->Close();
}

std::vector<Tuple> Executor::ExecuteAndCollect() {
    std::vector<Tuple> res;
    _plan->Open();
    while (auto tup = _plan->Next()) {
        res.push_back(*tup);
    }
    _plan->Close();
    return res;
}
```

\
All execution semantics live in the operator tree, not in the executor.

## Ownership and Lifetime

Ownership rules are explicit and strict:

* operators own their children (`std::unique_ptr`)
* schemas are shared and immutable (`std::shared_ptr<const Schema>)`
* relations are referenced, not owned
* tuples are value types and ephemeral

\
This avoids accidental sharing, lifetime bugs and hidden cycles in the operator graph.

# Conclusion

The executor engine simply takes in an operator tree and executes it. This is built from an SQL query to a logical plan, then to a physical plan and finally an operator tree. The next step is to build the query evaluation engine from a top-down approach (i.e starting from the SQL parser, then planner and optimiser).\
\
Once a working end-to-end relation db engine is created (from SQL parser to disk manager), the following improvements can be done:

1. Add more operators (joins, order by, aggregate etc)
2. Add table namespaces (e.g public.users, auth.users, catalog.tables etc)
3. Lots of refactoring within the codebase
