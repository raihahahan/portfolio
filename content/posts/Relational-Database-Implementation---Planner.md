---
title: Relational Database Implementation - Planner
published_at: 2026-03-19T16:00:00.000Z
read_time: 12
prev_post: content/posts/Relational-Database-Implementation---Parser.md
next_post: ''
excerpt: Logical and Physical Query Planning
---

> This blog is part of a series of posts where I document how I built a relational database from scratch in C++, following concepts from Postgresql and sqlite ([start here](https://mraihan.dev/blog/Implementing-a-relational-database-from-scratch---Storage-Layer)).\
> \
> **Summary of this post:**\
> 1\. Logical planning turns analyzed statements into a relational algebra tree\
> 2\. Physical planning maps each logical node to a concrete executor operator\
> 3\. CompilePredicate bridges WHERE clause expressions and runtime tuple evaluation\
> \
> **Github:** [https://github.com/raihahahan/cpp-relational-db](https://github.com/raihahahan/cpp-relational-db)

# Recap

So far, the storage and execution layers of the database engine are done.

1. **Disk manager:** Handles raw disk page I/O of 8192 bytes each.
2. **Buffer manager:** Acts as the cache layer to store working pages in-memory.
3. **Slotted Page:** Determines the layout of data within a single page.
4. **Access layer:** Provides heap files as the access path for the database. A heap file is a singly-linked list of pages to store records in a single relation.
5. **Catalog layer:** Manages metadata (tables, attributes, types) stored as tables themselves, with bootstrap logic for first-time initialisation.
6. **Model layer:** Handles user tables and dynamic schemas, bridging the catalog's metadata with the access layer's heap files.
7. **Executor engine:** Evaluates operator trees using the Volcano iterator model (Open/Next/Close). Operators include SeqScanOp, FilterOp, ProjectionOp, LimitOp, InsertOp, UpdateOp, and DeleteOp.
8. **Parser:** The lexer tokenises SQL text, the recursive-descent parser builds an abstract syntax tree, and the analyzer resolves names and types against the catalog to produce an `AnalyzedStmt`.

\
The parser gives the engine the ability to accept SQL strings and produce fully typed, catalog-validated representations. But there is still a gap: the analyzer outputs a `Query` or `AnalyzedInsert`, while the executor expects an operator tree. The planner bridges that gap. Given an analyzed statement, it produces a ready-to-execute operator tree.

# Introduction

In the [previous post](/blog/Relational-Database-Implementation---Parser), the parser was built to turn SQL text into a fully typed `AnalyzedStmt`. The planner takes that analyzed statement and converts it into an operator tree that the executor can evaluate.\
\
This separation, planning from execution, is the same approach used by Postgres. The key benefit is that the planner can reason about what the query needs (relational algebra) independently from how it gets executed (concrete operators and access methods).\
\
In this implementation, the planner has two stages:

* **Logical planning:** builds a tree of relational algebra nodes (scan, filter, project, limit) from the analyzed statement. This describes what the query wants to do without committing to any physical strategy.
* **Physical planning:** walks the logical tree and maps each node to a concrete executor operator (SeqScanOp, FilterOp, etc.). This is where access method decisions would be made in a more complete system (see [Postgres optimizer](https://www.postgresql.org/docs/current/planner-optimizer.html)).

```
SQL string
  |  Parser::Parse()
  v
AST (SelectStmt, InsertStmt, ...)
  |  Analyzer::Analyze()
  v
AnalyzedStmt (Query, AnalyzedInsert, ...)
  |  LogicalPlanner::Build()
  v
Logical Plan Tree (LogicalScan -> LogicalFilter -> ...)
  |  PhysicalPlanner::Build()
  v
Physical Operator Tree (SeqScanOp -> FilterOp -> ...)
  |  Executor::Execute()
  v
Result Tuples
```

# Logical plan

The logical plan is a tree of nodes, each representing a relational algebra operation. Every node implements a common interface:

```cpp
enum class LogicalPlanType {
    Scan,
    Filter,
    Project,
    Limit,
    Insert,
    Update,
    Delete
};

class LogicalPlan {
public:
    virtual ~LogicalPlan() = default;
    virtual LogicalPlanType Type() const = 0;
    virtual const std::vector<LogicalPlan*>& Children() const = 0;
};

using LogicalPlanPtr = std::unique_ptr<LogicalPlan>;
```

Each node knows its type and exposes its children. Leaf nodes (like scans) return an empty children vector. Non-leaf nodes return pointers to their children, allowing the physical planner to walk the tree recursively.

## Logical node types

### LogicalScan

The simplest node. It is a leaf that holds the name of the table to scan with no children and no predicates. It represents "read all rows from this table."

```cpp
class LogicalScan : public LogicalPlan {
public:
    explicit LogicalScan(std::string table_name);
    LogicalPlanType Type() const override;
    const std::vector<LogicalPlan*>& Children() const override;
    std::string TableName() const;

private:
    std::string _table_name;
};
```

### LogicalFilter

Wraps a child plan and an `AnalyzedExpr` predicate. The predicate is cloned from the analyzed statement at plan-build time, so the logical plan owns its own copy of the expression tree.

```cpp
class LogicalFilter : public LogicalPlan {
public:
    LogicalFilter(LogicalPlanPtr child,
                  std::unique_ptr<parser::AnalyzedExpr> pred);

    LogicalPlanType Type() const override;
    const std::vector<LogicalPlan*>& Children() const override;

    const parser::AnalyzedExpr& Predicate() const;
    LogicalPlan& Child() const;

private:
    LogicalPlanPtr _child;
    std::unique_ptr<parser::AnalyzedExpr> _pred;
    mutable std::vector<LogicalPlan*> _children_cache;
};
```

### LogicalProject

Wraps a child and specifies the output columns by name and ordinal position. Used for SELECT target lists, including `SELECT *` (the analyzer expands `*` into all columns before the planner sees it).

### LogicalLimit

Wraps a child and a row count. Corresponds to the `LIMIT` clause.

### DML nodes

`LogicalInsert`, `LogicalUpdate`, and `LogicalDelete` handle data modification. `LogicalInsert` is a leaf node that holds the table name, target columns, and value expressions. `LogicalUpdate` and `LogicalDelete` have a child plan (scan, optionally wrapped in a filter for the WHERE clause) and carry the table name and, for updates, the SET assignments.

# Logical planner: building the tree

The `LogicalPlanner` has separate `Build` overloads for each statement type. Each builds the logical tree bottom-up.

## SELECT

For a SELECT query, the logical planner builds the tree in a fixed order: Scan, then optionally Filter, then Project, then optionally Limit.

```cpp
LogicalPlanPtr LogicalPlanner::Build(const parser::Query& query) {
    // 1. Scan
    LogicalPlanPtr plan =
        std::make_unique<logical::LogicalScan>(query.range_table.table_name);

    // 2. Filter (if WHERE clause present)
    if (query.where_clause) {
        auto pred_copy = parser::clone(*query.where_clause);
        plan = std::make_unique<logical::LogicalFilter>(std::move(plan),
                                                        std::move(pred_copy));
    }

    // 3. Project
    std::vector<std::string> col_names;
    std::vector<uint16_t> col_positions;
    col_names.reserve(query.target_list.size());
    col_positions.reserve(query.target_list.size());
    for (const auto& te : query.target_list) {
        col_names.push_back(te.name);
        col_positions.push_back(te.column.ordinal_position);
    }
    plan = std::make_unique<logical::LogicalProject>(
        std::move(plan), std::move(col_names), std::move(col_positions));

    // 4. Limit (if present)
    if (query.limit_count) {
        plan = std::make_unique<logical::LogicalLimit>(std::move(plan),
                                                       *query.limit_count);
    }

    return plan;
}
```

The `parser::clone()` function deep-copies the `AnalyzedExpr` tree so the logical plan owns its own copy and is independent of the analyzer's output.\
\
For the query `SELECT name FROM students WHERE id >= 2 LIMIT 1`, the resulting logical tree looks like:

```
LogicalLimit (1)
    |
LogicalProject (name)
    |
LogicalFilter (id >= 2)
    |
LogicalScan (students)
```

## DML statements

INSERT, UPDATE, and DELETE each have their own `Build` overload. The pattern is similar: construct a scan, optionally wrap it in a filter for the WHERE clause, then wrap the result in the appropriate DML node.\
\
For example, the UPDATE builder:

```cpp
LogicalPlanPtr LogicalPlanner::Build(const parser::AnalyzedUpdate& upd) {
    LogicalPlanPtr plan =
        std::make_unique<logical::LogicalScan>(upd.table.table_name);

    if (upd.where_clause) {
        auto pred_copy = parser::clone(*upd.where_clause);
        plan = std::make_unique<logical::LogicalFilter>(std::move(plan),
                                                        std::move(pred_copy));
    }

    std::vector<std::pair<catalog::ColumnInfo,
                          std::unique_ptr<parser::AnalyzedExpr>>> cloned;
    for (const auto& [col, expr] : upd.assignments) {
        cloned.emplace_back(col, parser::clone(*expr));
    }

    return std::make_unique<logical::LogicalUpdate>(
        std::move(plan), upd.table.table_name, std::move(cloned));
}
```

This produces a tree of the form: `LogicalScan -> [LogicalFilter] -> LogicalUpdate`. DELETE follows the same pattern without the assignments. INSERT is simpler: it produces a standalone `LogicalInsert` leaf node with no children, since there is no existing data to scan.

# Physical planner

The physical planner takes a logical plan tree and produces an executable operator tree. It walks the logical tree recursively, mapping each node to its corresponding executor operator.\
\
Currently, the mapping is one-to-one:

* LogicalScan -> SeqScanOp
* LogicalFilter -> FilterOp
* LogicalProject -> ProjectionOp
* LogicalLimit -> LimitOp
* LogicalInsert -> InsertOp
* LogicalUpdate -> UpdateOp
* LogicalDelete -> DeleteOp

\
In a more complete system, this is where cost-based decisions would happen. For example, a LogicalScan could map to either a SeqScanOp or an IndexScanOp depending on whether a suitable index exists. A logical join could map to a nested-loop join, hash join, or merge join based on cost estimates. For now, the mapping is straightforward.\
\
The physical planner uses a `PlanningContext` that holds a pointer to the `TableManager`, allowing it to resolve table names to physical `Relation` objects:

```cpp
struct PlanningContext {
    model::TableManager* table_mgr;
};
```

The core of the physical planner is a recursive switch over the logical node type:

```cpp
std::unique_ptr<executor::Operator>
PhysicalPlanner::Build(const LogicalPlan& plan, PlanningContext& ctx) {
    switch (plan.Type()) {
    case LogicalPlanType::Scan: {
        auto& scan = static_cast<const logical::LogicalScan&>(plan);
        auto table = ctx.table_mgr->OpenTable(scan.TableName());
        return std::make_unique<executor::SeqScanOp>(*table);
    }

    case LogicalPlanType::Filter: {
        auto& filter = static_cast<const logical::LogicalFilter&>(plan);
        auto pred = CompilePredicate(filter.Predicate());
        auto child_op = Build(filter.Child(), ctx);
        return std::make_unique<executor::FilterOp>(
            std::move(child_op), pred);
    }

    case LogicalPlanType::Project: {
        auto& proj = static_cast<const logical::LogicalProject&>(plan);
        auto child_op = Build(*proj.Children()[0], ctx);
        auto schema = BuildOutputSchema(proj);
        return std::make_unique<executor::ProjectionOp>(
            std::move(child_op), ColumnsToPositions(proj), schema);
    }

    case LogicalPlanType::Limit: {
        auto& limit = static_cast<const logical::LogicalLimit&>(plan);
        auto child_op = Build(*limit.Children()[0], ctx);
        return std::make_unique<executor::LimitOp>(
            std::move(child_op), limit.Limit());
    }

    // ... Insert, Update, Delete cases follow the same pattern
    }
}
```

Each case recursively builds child operators first, then wraps them in the appropriate parent operator. The tree is built top-down by the recursive calls, but the operators are constructed bottom-up as the recursion unwinds.

# CompilePredicate

The analyzer produces WHERE clauses as `AnalyzedExpr` trees, a polymorphic hierarchy of column references, literals, binary expressions (AND, OR, comparisons), and unary expressions (NOT). The executor, however, needs a `std::function<bool(Tuple)>` wrapped in a `Predicate` object.\
\
`CompilePredicate` bridges this gap by recursively walking the expression tree and building nested lambdas that evaluate against a tuple at runtime.

```cpp
executor::Predicate
CompilePredicate(const parser::AnalyzedExpr& expr) {
    auto fn = compile(expr);
    return executor::Predicate{
        [fn](executor::Tuple t) { return fn(t); }};
}
```

The internal `compile` function handles each expression type:

* **AnalyzedColumnRef:** extracts the value from the tuple at the column's ordinal position
* **AnalyzedLiteral:** captures the constant value (integer or string)
* **AnalyzedBinaryExpr with AND/OR:** compiles both sides and short-circuits
* **AnalyzedBinaryExpr with comparison:** builds value-extractor lambdas for each side, then applies the comparison operator
* **AnalyzedUnaryExpr (NOT):** negates the compiled operand

\
For comparison operators, the compiler distinguishes between INT and TEXT types. Each side of the comparison (which may be a column reference or a literal) is compiled into a value-extracting lambda. The comparison operator is then applied to the extracted values.\
\
For example, the INT comparison path:

```cpp
if (cmp_type == catalog::INT_TYPE) {
    std::function<uint32_t(const Tuple&)> get_l, get_r;

    if (lhs_col) {
        uint16_t p = lhs_col->column.ordinal_position;
        get_l = [p](const Tuple& t) {
            return std::get<uint32_t>(t.GetValues()[p - 1]);
        };
    } else if (lhs_lit) {
        uint32_t v = static_cast<uint32_t>(std::stoul(lhs_lit->value));
        get_l = [v](const Tuple&) { return v; };
    }

    // ... same for rhs ...

    if (op == "=")
        return [get_l, get_r](const Tuple& t) {
            return get_l(t) == get_r(t);
        };
    if (op == ">=")
        return [get_l, get_r](const Tuple& t) {
            return get_l(t) >= get_r(t);
        };
    // ... <, >, <=, != follow the same pattern
}
```

This approach means predicate compilation happens once at plan-build time, while the resulting lambda is invoked per-tuple during execution. The compile step is O(expression tree size), and the per-tuple evaluation is O(number of comparisons in the WHERE clause).

# Plan-time evaluation

Not every expression in SQL needs to be evaluated per-tuple. Consider the difference between a WHERE clause and an INSERT values list:

```sql
-- WHERE: id varies per tuple, must be evaluated at runtime
SELECT * FROM users WHERE id >= 2

-- VALUES: 1, 'Alice', 25 are constants, known before any rows are read
INSERT INTO users VALUES (1, 'Alice', 25)

-- SET: 30 is a constant, does not depend on the current row
UPDATE users SET age = 30 WHERE name = 'Alice'
```

In the WHERE clause, `id >= 2` references a column whose value changes with every row the executor reads. This is why `CompilePredicate` produces a lambda that takes a `Tuple` argument and evaluates the expression at runtime. But in the INSERT and UPDATE cases, the values `1`, `'Alice'`, `25`, and `30` are all literals. They do not depend on any row data, so the planner can resolve them to concrete `Value` objects immediately, before the executor ever starts running.\
\
This is what `EvaluateExprToValue` does. It takes an `AnalyzedExpr` and, if it is a literal, converts it to the engine's `Value` type:

```cpp
common::Value EvaluateExprToValue(const parser::AnalyzedExpr& expr) {
    if (auto* lit = dynamic_cast<const parser::AnalyzedLiteral*>(&expr)) {
        if (lit->result_type == catalog::INT_TYPE)
            return common::Value{static_cast<uint32_t>(std::stoul(lit->value))};
        if (lit->result_type == catalog::TEXT_TYPE)
            return common::Value{lit->value};
    }
    throw std::runtime_error("EvaluateExprToValue: unsupported expression");
}
```

Two helper functions use this to prepare data for the executor:

* `EvaluateInsertValues` walks every row in an INSERT's values list and converts each `AnalyzedExpr` into a `Value`, producing a `std::vector<std::vector<Value>>` that the `InsertOp` can write directly to disk.
* `EvaluateAssignments` does the same for UPDATE SET clauses, producing `std::vector<std::pair<uint16_t, Value>>` where each pair is an ordinal position and its new value.

```cpp
std::vector<std::vector<common::Value>>
EvaluateInsertValues(const logical::LogicalInsert& ins) {
    std::vector<std::vector<common::Value>> rows;
    for (const auto& analyzed_row : ins.Values()) {
        std::vector<common::Value> row;
        for (const auto& val_expr : analyzed_row) {
            row.push_back(EvaluateExprToValue(*val_expr));
        }
        rows.push_back(std::move(row));
    }
    return rows;
}
```

The key simplification is that the executor never needs to interpret expression trees for DML operations. It receives plain `Value` objects and just writes them.\
\
The limitation of this approach is that only literal expressions are supported. A statement like `UPDATE users SET age = age + 1` would not work, because `age + 1` references a column and requires per-tuple evaluation. Supporting this would require extending the UPDATE operator to accept a compiled expression (similar to `CompilePredicate`) instead of a static value. This is a future improvement.

# End-to-end example

With the planner in place, executing a SQL query is now fully automated. From the REPL in `main.cpp`:

```cpp
auto ast = parser::Parser::Parse(line);
parser::Analyzer analyzer{catalog};
auto stmt = analyzer.Analyze(*ast);
planner::PlanningContext ctx{&table_mgr};

if (stmt->type == parser::StmtType::Select) {
    auto logical_plan =
        planner::LogicalPlanner::Build(*stmt->select_query);
    auto physical_plan =
        planner::PhysicalPlanner::Build(*logical_plan, ctx);
    executor::Executor exec{std::move(physical_plan)};
    auto results = exec.ExecuteAndCollect();

    for (const auto& row : results) {
        print_tuple(row);
    }
}
```

For DML statements (INSERT, UPDATE, DELETE), the flow is the same: build logical plan, build physical plan, execute. DDL statements (CREATE TABLE, DROP TABLE) bypass the planner entirely and go directly to utility executor functions, since they don't involve relational algebra.

# Future work

The planner currently makes simple one-to-one mappings from logical nodes to physical operators. Future improvements include:

1. Cost-based optimisation: when multiple physical strategies exist for a logical node (e.g. sequential scan vs index scan, nested-loop join vs hash join), use cost estimates to pick the cheapest plan
2. Query rewriting and optimisation rules (e.g. predicate pushdown, join reordering)
3. Runtime expression evaluation for UPDATE SET clauses that reference columns or arithmetic
4. Support for more logical nodes: joins, aggregation, sorting, subqueries

# Summary

The planner completes the automated SQL pipeline. An SQL string now flows through parsing, semantic analysis, logical planning, physical planning, and execution without any manual operator construction. The two-stage design keeps relational reasoning (logical plan) cleanly separated from physical execution strategy, making it straightforward to add new operators and, in the future, cost-based optimisation.

# References

* [PostgreSQL source: `src/backend/optimizer/plan/planner.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/plan/planner.c) - main planner entry point (standard_planner, subquery_planner)
* [PostgreSQL source: `src/backend/optimizer/plan/createplan.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/plan/createplan.c) - converts the best path into a physical plan tree (analogous to PhysicalPlanner::Build)
* [PostgreSQL source: `src/backend/optimizer/path/allpaths.c`](https://github.com/postgres/postgres/blob/master/src/backend/optimizer/path/allpaths.c) - path enumeration for base relations and joins. PostgreSQL explores many candidate paths before choosing the cheapest, whereas this implementation does a direct one-to-one mapping
* [PostgreSQL Documentation: Planner/Optimizer](https://www.postgresql.org/docs/current/planner-optimizer.html) - official overview of how PostgreSQL generates and selects query plans
* [The SQL Query Roadtrip: The Query Planner](https://internals-for-interns.com/posts/postgres-query-planner/) - detailed walkthrough of how PostgreSQL's planner chooses execution strategies, including cost estimation and path selection
