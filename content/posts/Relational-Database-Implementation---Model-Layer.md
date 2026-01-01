---
title: Relational Database Implementation - Model Layer
published_at: 2025-12-31T16:00:00.000Z
read_time: 5
prev_post: content/posts/Relational-Database-Implementation---Catalog.md
next_post: ''
excerpt: Model Layer - The layer that makes the database schema aware
---

> This blog is part of a series of posts where I document how I built a relational database from scratch in C++, following concepts from Postgresql and sqlite ([start here](https://mraihan.dev/blog/Implementing-a-relational-database-from-scratch---Storage-Layer)).\
> \
> **Summary of this post:**\
> 1\. Model layer is the logical bridge between the low-level physical storage and higher-level database abstractions\
> 2\. It is responsible for schema enforcement, data serialisation (encoding/decoding), and managing table instances\
> 3\. Table Manager handles opening tables and caching it in-memory\
> \
> **Github:** [https://github.com/raihahahan/cpp-relational-db](https://github.com/raihahahan/cpp-relational-db)

# Introduction

The model layer serves as the logical bridge between the physical storage (Heap Files, Pages) and the database's higher-level abstractions (Tables, Rows, Values). While the access layer provides raw record storage, the model layer introduces the concept of a "Table", a structured entity with a defined schema, specific data types, and named columns.\
\
This layer is responsible for translating logical rows (represented as C++ variants) into the binary formats required by the underlying storage. It handles the complexities of memory alignment, type-safe serialisation, and the lifecycle management of table instances within the database engine.\
\
This post covers:

* The design of the Relation base class and UserTable
* Difference between user tables and catalog tables.\\
* Binary serialisation via the DynamicCodec
* The TableManager caching registry

# User Tables and Relations

In this implementation, every table-like structure is a "Relation." A hierarchy is established where both system catalogs and user-defined tables share a common foundation.

## Relation Base Class

The `Relation` class encapsulates a HeapFile and provides a standardised interface for physical interaction. Its primary role is to act as a gateway to the storage layer, potentially holding future logic for MVCC (Multi-Version Concurrency Control) tuple headers.

```cpp
Relation::Relation(HeapFile hf) : _hf{std::move(hf)} {}
std::optional<RID> Relation::InsertRaw(std::span<const uint8_t> bytes, size_t len) {
  const char* data = reinterpret_cast<const char*>(bytes.data());
  return _hf.Insert(data, len);
}

```

## Static vs. Dynamic: CRTP and Metadata-Driven Logic

A key design challenge was handling the difference between internal system tables (Catalogs) and user-created tables.

* Catalog Tables (CRTP): Since the schemas for system catalogs are known at compile-time and hardcoded, I use the Curiously Recurring Template Pattern (CRTP). This allows for static polymorphism, enabling the compiler to optimise access and serialisation without the overhead of virtual function calls.
* User Tables (Metadata-Driven): User tables have schemas defined at runtime. We don't know the columns or types until a user executes a CREATE TABLE statement. Unlike the Catalog, which uses template-level specialisation, UserTable relies on metadata-driven logic. It uses a runtime ColumnInfo vector to instruct the DynamicCodec on how to interpret raw bytes, providing the flexibility of a dynamic schema without the need for complex vtable hierarchies.

\
The `UserTable` implementation stores this dynamic schema and uses it to drive the serialisation process:

```cpp
UserTable::UserTable(HeapFile hf, std::vector<ColumnInfo> schema, table_id_t table_id) :
                        Relation{std::move(hf)},
                        _schema{std::move(schema)},
                        _table_id{table_id} {};

std::optional<RID> UserTable::Insert(const std::vector<Value> values) {
  auto bytes = DynamicCodec::Encode(values, _schema);
  return InsertRaw(bytes, bytes.size());
}

```

In contrast, below is a snippet of derived catalog tables:

```cpp
// base catalog table
template <typename Row, typename Codec>
requires CatalogCodec<Row, Codec>
class CatalogTable : public model::Relation {
    static_assert(!std::is_trivially_copyable_v<Row>,
        "Catalog rows must use explicit codecs, not memcpy");
public:
    explicit CatalogTable(HeapFile hf) : Relation{std::move(hf)} {};
    std::optional<db::access::RID> Insert(const Row& row) {
        auto bytes = Codec::Encode(row);
        auto rid = InsertRaw(bytes, bytes.size());
        return rid;
    }
    ...
};

// db_tables
class TablesCatalog
    : public CatalogTable<TableInfo, codec::TableInfoCodec> {
public:
    using Base = CatalogTable<TableInfo, codec::TableInfoCodec>;
    using Base::Base;

    std::optional<TableInfo> Lookup(std::string_view table_name);
};

// db_attributes
class AttributesCatalog
    : public CatalogTable<ColumnInfo, codec::ColumnInfoCodec> {
public:
    using Base = CatalogTable<ColumnInfo, codec::ColumnInfoCodec>;
    using Base::Base;

    std::vector<ColumnInfo> GetColumns(table_id_t table_id);
};
```

# `Dynamic Codec`

Serialising data for a database isn't as simple as dumping bytes into a buffer. To ensure performance and architecture compatibility, data must be properly aligned (e.g. a 4-byte integer should start at a memory address divisible by 4).\
\
The `DynamicCodec` handles this by calculating padding between fields.

## Alignment and Padding

Different types have different alignment requirements defined in the catalog. Before writing a field, the codec checks the current buffer size and adds the necessary null bytes to reach the next valid boundary.

```cpp
void applyPadding(std::vector<uint8_t>& buffer, catalog::type_id_t type_id) {
  size_t alignment = getAlignment(type_id);
  size_t current_size = buffer.size();
  size_t remainder = current_size % alignment;
  size_t padding_needed = (remainder == 0) ? 0 : (alignment - remainder);
  buffer.resize(buffer.size() + padding_needed, 0);
}
```

## Encoding Values

The codec uses `std::visit` to handle the `Value` variant (which can be a `uint32_t` or `std::string` as of the time of writing). This allows the serialisation logic to stay generic while correctly calling type-specific writers.

```cpp
std::vector<uint8_t> DynamicCodec::Encode(
    const std::vector<Value>& values,
    const std::vector<ColumnInfo> schema) {
    
    std::vector<uint8_t> buffer;
    for (size_t i = 0; i < values.size(); ++i) {
        applyPadding(buffer, schema[i].type_id);
        std::visit([&](auto&& arg) {
            util::data::WriteData(buffer, arg);
        }, values[i]);
    }
    return buffer;
}
```

# Table Manager

The final piece is the TableManager. Opening a table is an expensive operation. It requires looking up metadata in the catalogs, identifying the correct Heap File, and initialising storage handles.\
\
To optimise this, the TableManager maintains a cache of UserTable instances. When a table is requested by name, the manager:

1. Checks the cache for an existing instance.
2. If not found, look up the table and attribute info from the catalogs.
3. Opens the underlying HeapFile.
4. Constructs a UserTable and stores it in the cache for future use.

```cpp
std::shared_ptr<UserTable> TableManager::OpenTable(std::string_view name) {
    if (_cache.contains(name)) return _cache[name];

    auto table_info = _catalog->GetTablesCatalog()->Lookup(name);
    if (!table_info.has_value()) throw std::runtime_error("Invalid table name.");

    auto cols = _catalog->GetAttributesCatalog()->GetColumns(table_info->table_id);
    auto hf = access::HeapFile::Open(_catalog->GetBm(), _catalog->GetDm(), table_info->heap_file_id, table_info->first_page_id);

    auto rel = std::make_shared<UserTable>(std::move(hf), std::move(cols), table_info->table_id);
    _cache[name] = rel;
    return rel;
}
```

This ensures that different parts of the database engine (like the query executor and the optimiser) are always working with the same consistent table object.

# Minimal working engine

With that, a minimal working engine program can now be created as seen below (where only inserting into user table works):

```cpp
DiskManager* dm = new DiskManager("database.db");
BufferManager* bm = new BufferManager(CLOCK, dm);
Catalog* catalog = new Catalog(bm, dm);

// initialise catalog
catalog->Init();

// initialise table manager
TableManager manager{catalog};

// create table
// first need to create schema
auto id_col_id = util::GenerateUUID();
auto name_col_id = util::GenerateUUID();
std::vector<catalog::RawColumnInfo> schema = {
    { id_col_id, "id", catalog::INT_TYPE, 1 },
    { name_col_id, "name", catalog::TEXT_TYPE, 2}
};

// table operations
auto table_id = manager.CreateTable("students", schema);
auto students_table = manager.OpenTable("students");
std::vector<Value> row = { uint32_t{1}, "Raihan" };
auto rid = students_table.Insert(row);

```

# Future Work

The model layer currently supports basic types and simple sequential inserts. Moving forward, I plan to:

* Expand the Value variant to support floats, booleans, and nulls.
* Add support for primary keys and foreign key constraints within the UserTable logic.

# Summary

With the storage, access, and catalog layers implemented, the database now has a solid foundation. Pages can be persisted to disk, cached in memory, organised into heap files, and described using a self-contained catalog. Schema-aware rows are able to be inserted into user tables, and user tables can be created.

## What can be built now

With these layers in place, I can now build a complete end-to-end prototype. A parser and query executor can be layered on top of the catalog, model and access layer to support basic SQL operations such as CREATE TABLE, INSERT, and SELECT.\
\
Once a working prototype exists, the focus can shift toward more advanced database concerns. A query optimiser can be introduced to reason about access paths and operator ordering, replacing sequential scans with cost-based decisions. Index structures such as B+ trees can be integrated into the access layer to accelerate both catalog and user queries.\
\
Beyond that, concurrency control and recoverability are the next major milestones. Supporting multiple concurrent transactions requires careful coordination between locking, logging, and buffer management. Recovery mechanisms such as write-ahead logging are needed to ensure durability and correctness in the presence of crashes.\
\
In the future, this database can be extended for distributed systems: replication, sharding, and coordination across multiple nodes.
