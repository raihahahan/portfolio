---
title: Relational Database Implementation - Catalog Layer
published_at: 2025-12-29T20:00:00.000Z
read_time: 15
prev_post: content/posts/Relational-Database-Implementation---Access-Layer-Heap.md
next_post: ''
excerpt: Catalog Layer and DB server
---

> This blog is part of a series of posts where I document how I built a relational database from scratch in C++, following concepts from Postgresql and sqlite. (Start from [here](/blog/Implementing-a-relational-database-from-scratch---Storage-Layer))\
> \
> Summary of this post:\
> 1\. Catalog layer manages the database's metadata (tables, types, columns etc)\
> 2\. Catalog table uses heap iterator directly for sequential scan\
> 3\. Encoding and decoding rows are done with a generic Codec class\
> 4\. DB server handles creating and connecting to different databases\
> \
> Github: [https://github.com/raihahahan/cpp-relational-db](https://github.com/raihahahan/cpp-relational-db)

# Introduction

The catalog layer is responsible for managing the database’s metadata. This includes information about tables, columns, types, and how these pieces are laid out on disk. In many ways, the catalog is the database describing itself. This is also how [Postgres maintains metadata of its database system](https://www.postgresql.org/docs/current/catalogs.html).\
\
So far, this has been the hardest layer to implement. Unlike the storage and access layers, which deal with relatively concrete concepts like pages and records, the catalog is highly self-referential. It needs to exist before any user data can be stored, yet it is itself stored using the same heap files and pages as ordinary tables. Getting this bootstrapping process correct, while keeping the design clean and extensible, was really tricky (chicken and egg problem).\
\
At a high level, the catalog layer sits above the access layer. It uses heap files to store metadata, and in turn exposes structured views of that metadata to higher layers such as the query engine. In future iterations, this same layer will also coordinate with indexes (e.g. B+ trees, hash indexes) to resolve names and speed up lookups.\
\
This post starts by describing the core Catalog abstraction, which acts as the control plane for all metadata management.

# Catalog

The Catalog class is the main entry point into the catalog layer. It owns and coordinates all system catalogs, and is responsible for ensuring that metadata is correctly initialised and loaded on startup. Conceptually, the catalog has two modes of operation:

* bootstrap, when the database is created for the first time
* load, when an existing database is opened and metadata already exists on disk

## Ownership and lifecycle

The catalog is constructed with references to the buffer manager and disk manager. It does not perform any I/O on construction. Instead, initialisation is explicit.

```cpp
class Catalog {
  public:
    explicit Catalog(BufferManager* bm, DiskManager* dm);
    void Init();
    ...
};


```

Calling `Init()` is what brings the catalog to a usable state. Internally, this method determines whether the catalog has already been initialised on disk, and dispatches to the appropriate path.

```cpp
void Catalog::Init() {
  if (IsInitialised()) {
    LoadCatalogs();
    return;
  }
  BootstrapCatalogs();
}
```

## Bootstrapping and loading the catalog

The catalog has a unique problem compared to other layers: it must exist before any user data can be stored, yet it is itself stored using ordinary heap files and pages. This creates a bootstrapping challenge. The system needs a reliable way to determine whether catalog metadata already exists on disk, and if not, to create it from scratch in a well-defined layout.\
\
This implementation addresses that by reserving a small, fixed set of page IDs with predefined meanings. These pages act as anchors that allow the catalog to be discovered and reconstructed on every restart.

### Root page and magic number

Page 0 of the database file is reserved as the catalog root page. This page does not store table data. Instead, it contains a small header (DBHeaderPage) with a magic number that identifies the file as an initialised database.\
\
On startup, the catalog checks whether the database has already been initialised by reading page 0 and inspecting this magic value:

```cpp
bool Catalog::IsInitialised() const {
  if (_dm->GetNumPages() <= 0) return false;
  char buf[config::PAGE_SIZE];
  _dm->ReadPage(ROOT_PAGE_ID, buf);
  auto* hdr = reinterpret_cast<const storage::DBHeaderPage*>(buf);
  return hdr->magic == config::DB_MAGIC;
}
```

If the file is empty, or if the magic number does not match, the database is treated as uninitialised. This check is deliberately simple and conservative: if anything looks wrong, the system assumes that bootstrapping is required.\
\
The presence of the correct magic number on page 0 becomes the single source of truth for whether catalog metadata exists on disk.

### Loading existing catalogs

If the database is already initialised, the catalog follows the load path. In this case, no new pages are allocated. Instead, the catalog reconstructs its in-memory state by opening the known system heap files using fixed file IDs and root page IDs.

```cpp
void Catalog::LoadCatalogs() {
  auto table_hf = HeapFile::Open(
      _bm, 
      _dm, 
      DB_TABLES_FILE_ID,
      DB_TABLES_ROOT_PAGE_ID
  );

  auto attr_hf = HeapFile::Open(
      _bm, 
      _dm, 
      DB_ATTRIBUTES_FILE_ID,
      DB_ATTRIBUTES_ROOT_PAGE_ID
  );

  auto types_hf = HeapFile::Open(
      _bm, 
      _dm, 
      DB_TYPES_FILE_ID,
      DB_TYPES_ROOT_PAGE_ID
  );

  _tables.emplace(TablesCatalog(table_hf));
  _attributes.emplace(AttributesCatalog(attr_hf));
  _types.emplace(TypesCatalog(types_hf));
}

```

The key idea here is that the physical location of the system catalogs is fixed and known ahead of time. As long as these root pages are intact, the catalog can always be reconstructed by reopening the corresponding heap files.\
\
At this stage, no metadata is interpreted or validated beyond opening the heap files. The catalog simply re-establishes access to the underlying system tables, which are then queried as needed by higher layers.\
\
Note: an improvement here could be that `IsInitialised()` checks for the existence of the catalog pages too instead of just the magic number.

### Bootstrapping the catalog

If the database is not initialised, the catalog enters the bootstrap path. This process is responsible for creating the minimal set of metadata needed for the database to describe itself.\
\
Bootstrapping proceeds in a carefully defined order. First, page 0 is allocated and initialised as the catalog root page:

```cpp
page_id_t pid = _dm->AllocatePage();
assert(pid == ROOT_PAGE_ID);
char page[config::PAGE_SIZE]{};
auto* hdr = reinterpret_cast<storage::DBHeaderPage*>(page);
hdr->magic = config::DB_MAGIC;
_dm->WritePage(pid, page);
```

Writing the magic number is the final step that marks the database as initialised. From this point onward, the database will follow the load path on restart. \
\
Next, fixed root pages are allocated for each system catalog heap file:

* db\_tables
* db\_attributes
* db\_types

\
Each of these heap files is assigned a predefined root page ID. These page IDs are asserted during bootstrap to ensure that the on-disk layout matches the expected structure.

```cpp
// db_tables
page_id_t p1 = _dm->AllocatePage();
assert(p1 == DB_TABLES_ROOT_PAGE_ID);
{
    auto* frame1 = _bm->request(p1);
    access::HeapFile::InitHeapPage(frame1->data);
    _bm->mark_dirty(frame1);
    _bm->unpin(frame1);
}

// db_attributes
page_id_t p2 = _dm->AllocatePage();
assert(p2 == DB_ATTRIBUTES_ROOT_PAGE_ID);
{
  auto* frame2 = _bm->request(p2);
  access::HeapFile::InitHeapPage(frame2->data);
  _bm->mark_dirty(frame2);
  _bm->unpin(frame2);
}

// db_types
page_id_t p3 = _dm->AllocatePage();
assert(p3 == DB_TYPES_ROOT_PAGE_ID);
{
  auto* frame3 = _bm->request(p3);
  access::HeapFile::InitHeapPage(frame3->data);
  _bm->mark_dirty(frame3);
  _bm->unpin(frame3);
}
```

Each root page is then initialised as an empty heap page using the same heap page layout as user tables. This is a deliberate design choice: system catalogs are not stored using any special page format.

### Creating catalog table abstractions

Once the heap pages for system catalogs exist on disk, the catalog constructs in-memory wrappers around them:

```cpp
_tables.emplace(TablesCatalog(
  HeapFile::Open(_bm, // buffer manager
                _dm,  // disk manager
                DB_TABLES_FILE_ID, // heap file id
                DB_TABLES_ROOT_PAGE_ID) // page id
));
```

At this point, the catalog is structurally complete. It has heap files for tables, attributes, and types, but those heap files are still empty. The final step of bootstrapping is to populate them with initial metadata.

### Inserting built-in metadata

Bootstrapping inserts two categories of initial records. \
\
The first category is built-in types. Primitive types such as integers and variable-length text are inserted into the type catalog, along with their size information. These entries allow columns in later tables to reference types using stable identifiers.

```cpp
void Catalog::InsertBuiltinTypes() {
  // INT
  _types.value().Insert(TypeInfo{
    .type_id = INT_TYPE,
    .size = INT_SIZE // in bytes
  });

  // TEXT (variable length)
  _types.value().Insert(TypeInfo{
    .type_id = TEXT_TYPE,
    .size = TEXT_SIZE
  });
}
```

The second category is self-describing catalog metadata. The catalog inserts entries describing the system tables themselves into `db_tables`, and inserts corresponding column definitions into `db_attributes`.\
\
For example, the `db_tables` table is described as a table with columns such as `table_id`, `table_name`, `heap_file_id`, and `first_page_id`. Similar metadata is inserted for `db_attributes` and `db_types`.

```cpp
// db_tables
_tables.value().Insert(TableInfo{
        .table_id = DB_TABLES_TABLE_ID,
        .table_name = DB_TABLES_TABLE,
        .heap_file_id = DB_TABLES_FILE_ID,
        .first_page_id = DB_TABLES_ROOT_PAGE_ID
});

_attributes.value().Insert({ DB_TABLES_TABLE_ID, util::GenerateUUID(), "table_id", INT_TYPE, 1});
_attributes.value().Insert({ DB_TABLES_TABLE_ID, util::GenerateUUID(), "table_name", TEXT_TYPE, 2});
_attributes.value().Insert({ DB_TABLES_TABLE_ID, util::GenerateUUID(), "heap_file_id", INT_TYPE, 3});
_attributes.value().Insert({ DB_TABLES_TABLE_ID, util::GenerateUUID(), "first_page_id", INT_TYPE, 4});
```

### Finalising bootstrap

After all initial metadata has been inserted, the buffer manager is flushed to ensure that all catalog pages are persisted to disk: `_bm->flush_all();`\
\
At this point, the catalog is fully initialised. Subsequent restarts will detect the magic number on page 0 and load the catalog directly from disk without re-running the bootstrap logic.\
\
This bootstrapping process ensures that the catalog is:

* discoverable via fixed root pages
* stored using the same mechanisms as user data
* fully reconstructible after restart

\
It also clearly separates one-time initialisation from normal database operation, which simplifies reasoning about correctness and recovery.

# Catalog tables and metadata access

The catalog tables are where metadata actually lives. Tables, columns, and types are all stored as records inside heap files, and the catalog layer provides structured access to this metadata. \
\
At this stage of the system, catalog access is deliberately simple. There is no query optimiser or execution engine yet, so all catalog lookups are implemented using explicit iteration over heap files. While this would be inefficient for user data, it is a reasonable and pragmatic choice for metadata, which is typically small and accessed infrequently.\
\
This also keeps the catalog layer independent of the query engine, avoiding circular dependencies during early bootstrapping.

## Manual iteration over heap files

Each catalog table is backed by a heap file. Operations such as looking up a table by name or retrieving all columns for a table are implemented as sequential scans over the heap file.\
\
For example, looking up a table by name involves iterating over all records in db\_tables, decoding each record, and comparing the table name:

```cpp
std::optional<TableInfo> TablesCatalog::Lookup(std::string_view table_name) {
  for (auto it = _hf.begin(); it != _hf.end(); ++it) {
    auto rec = *it;
    auto bytes = std::span<const uint8_t>{
      reinterpret_cast<const uint8_t*> (rec.data),
      rec.size
    };

    auto table = codec::TableInfoCodec::Decode(bytes);
    if (table.table_name == table_name) {
      return table;
    }
  }
  return std:: nullopt;
}
```

Similarly, retrieving all columns for a table is implemented by scanning `db_attributes` and filtering on `table_id`.

```cpp
std::vector<ColumnInfo> AttributesCatalog::GetColumns(table_id_t table_id) {
    std::vector<ColumnInfo> res;
    for (auto it = _hf.begin(); it != _hf.end(); ++it) {
        auto rec = *it;
        auto bytes = std::span<const uint8_t>{
            reinterpret_cast<const uint8_t*>(rec.data),
            rec.size
        };
        
        auto col = codec::ColumnInfoCodec::Decode(bytes);
        if (col.table_id == table_id) {
            res.emplace_back(col);
        }
    }
    return res;
}

std::vector<TypeInfo> TypesCatalog::GetTypes() {
    std::vector<TypeInfo> res;
    for (auto it = _hf.begin(); it != _hf.end(); ++it) {
        auto rec = *it;
        auto bytes = std::span<const uint8_t>{
            reinterpret_cast<const uint8_t*>(rec.data),
            rec.size
        };
        
        auto type = codec::TypeInfoCodec::Decode(bytes);
        res.emplace_back(type);
    }
    return res;
}
```

## Difference from the query executor

It is important to note that this iteration logic lives entirely inside the catalog layer. The catalog is not executing queries in the relational sense. It is simply traversing heap files using iterators provided by the access layer.\
\
Later on, the query executor will:

* operate on user tables
* build logical and physical plans
* support predicates, joins, and projections

\
By contrast, the catalog performs fixed-purpose scans with hard-coded logic. This separation keeps the catalog usable during system startup, before the query engine even exists.

## Catalog table abstraction

To avoid duplicating heap-file logic across different catalog tables, a common base abstraction is used.

```cpp
template <typename Row, typename Codec>
requires CatalogCodec<Row, Codec> // explained below
class CatalogTable {
public:
  explicit CatalogTable(HeapFile hf): _hf { std::move(hf) } {}
  std::optional<RID> Insert(const Row& row) {
    auto bytes = Codec:: Encode(row);
    return _hf.Insert(
    reinterpret_cast <const char*> (bytes.data()),
        bytes.size()
    );
  }

protected:
  HeapFile _hf;
};
```

Each concrete catalog table specifies:

* the row type it stores (e.g. TableInfo, ColumnInfo)
* the codec used to encode and decode that row type

\
This keeps the mechanics of heap-file interaction centralised while allowing each catalog table to expose domain-specific operations.

## CRTP, concepts, and compile-time constraints

The catalog table abstraction uses templates and concepts to enforce correctness at compile time. A `CatalogCodec` concept ensures that every catalog table provides a matching codec with Encode and Decode functions: (Note: see the section below for the explanation on the `Codec` class)

```cpp
template <typename Row, typename Codec>
  concept CatalogCodec =
    requires(const Row& row, std::span <const uint8_t> bytes) {
      { Codec:: Encode(row) } -> std::same_as<std::vector<uint8_t>>;
      { Codec:: Decode(bytes) } -> std::same_as<Row>;
};
```

This prevents accidental mismatches between row types and codecs. Additionally, catalog rows are explicitly forbidden from being trivially copyable:

```cpp
static_assert(!std::is_trivially_copyable_v<Row>,
  "Catalog rows must use explicit codecs, not memcpy");
```

This is a deliberate design choice. Catalog records should be encoded explicitly, rather than relying on raw memory copies, to make layout assumptions visible and auditable. The encoding logic itself is handled by the codec layer, which is explained in the next section.\
\
Concrete catalog tables then inherit from this base using a [CRTP-style pattern](https://stackoverflow.com/a/4173298):

```cpp
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

// db_types
class TypesCatalog
    : public CatalogTable<TypeInfo, codec::TypeInfoCodec> {
public:
    using Base = CatalogTable<TypeInfo, codec::TypeInfoCodec>;
    using Base::Base;
    std::vector<TypeInfo> GetTypes();
};
```

This avoids virtual dispatch while still allowing each catalog table to define its own lookup and query logic.

# Encoding catalog records

The catalog codec is responsible for translating structured catalog metadata into raw bytes that can be stored inside heap files, and for reconstructing those structures when reading from disk. This layer sits at the boundary between strongly typed C++ objects and the untyped byte-oriented storage provided by the access layer.\
\
Unlike user data, catalog records are part of the database’s internal state. Bugs here can corrupt the database’s understanding of itself, so the codec is designed to be explicit, predictable, and conservative.

## Why not `memcpy` entire structs?

A tempting approach would be to write catalog structs directly to disk using memcpy. This is deliberately avoided.\
\
Most catalog rows contain fields such as `std::string`, which manage heap-allocated memory internally. Blindly copying such objects would serialise pointer values rather than the underlying data, producing invalid on-disk representations. Even for structs without dynamic fields, layout and padding are easy to get wrong unless explicitly constrained.\
\
Instead, catalog records are encoded field-by-field using a small set of well-defined primitives.

## Compile-time layout guarantees

To make these assumptions explicit, the codec relies on C++20 concepts built on top of std::is\_trivially\_copyable and std::is\_standard\_layout. These concepts act as compile-time contracts that constrain which types are allowed to participate in fixed-width serialisation.

```cpp
template <typename T>
  concept FixedWidthSerializable =
    std::is_trivially_copyable_v<T> &&
      std::is_standard_layout_v<T>;
```

These constraints are applied to fixed-width values such as integers and identifiers. Any attempt to serialise a type that violates these constraints fails at compile time rather than silently producing an invalid on-disk representation.

### `std::is_trivially_copyable`

This trait guarantees that a type can be copied byte-for-byte using memcpy without invoking constructors, destructors, or custom copy logic. In practice, this means avoiding any of the below:

* dynamic memory ownership
* virtual functions
* user-defined copy semantics

\
Primitive integers and small POD-like (Plain Old Data) types fall into this category.

### `std::is_standard_layout`

This trait guarantees that a type has a predictable memory layout compatible with C-style structs. In particular:

* members are laid out in declaration order
* there is no unexpected reordering
* the object representation is well-defined

\
Together, these traits ensure that copying a value’s bytes to disk and reading them back later will faithfully reconstruct the original value. Only types that satisfy both properties are allowed to be serialised using the fixed-width helpers.

## Encoding primitives

The codec defines a small set of low-level utilities for writing and reading values from a byte buffer.

### Fixed-width encoding

Fixed-width values are appended directly to the buffer in their in-memory representation, but only if they satisfy the fixed width constraint.

```cpp
template <FixedWidthSerializable T>
  inline void WriteData(std::vector<uint8_t>& buf, T v) {
    uint8_t bytes[sizeof(T)];
    std:: memcpy(bytes, & v, sizeof(v));
    buf.insert(buf.end(), bytes, bytes + sizeof(v));
}
```

### Variable-width encoding

Not all catalog fields have a fixed representation. Strings and similar types require a length prefix followed by raw bytes. These are handled using a separate concept that describes size-addressable views over contiguous memory.

```cpp
template <VariableWidthSerializable T>
inline void WriteData(std::vector<uint8_t>& buf, T v) {
    WriteData(buf, static_cast<uint32_t>(v.size()));
    buf.insert(buf.end(),
                reinterpret_cast<const uint8_t*>(v.data()),
                reinterpret_cast<const uint8_t*>(v.data() + v.size()));
};
```

Fixed-width and variable-width encodings share the same interface, with overload selection driven entirely by compile-time constraints. This produces a compact and self-describing encoding without relying on null terminators. Decoding mirrors this process by reading values sequentially from a byte span while advancing an explicit offset.

## Record-level codecs

Each catalog row type has a corresponding codec that defines how it is serialised and deserialised. For example, the table catalog codec encodes a TableInfo record field-by-field:

```cpp
std::vector<uint8_t> TableInfoCodec::Encode(const TableInfo& row) {
  std::vector<uint8_t> buf;
  utilities::WriteData(buf, row.first_page_id);
  utilities::WriteData(buf, row.heap_file_id);
  utilities::WriteData(buf, row.table_id);
  utilities::WriteData(buf, row.table_name);
  return buf;
}
```

Decoding reverses the process in the same order:

```cpp
TableInfo TableInfoCodec::Decode(std::span<const uint8_t> bytes) {
    TableInfo t;
    size_t off = 0;
    t.first_page_id = utilities::ReadData<page_id_t>(bytes, off);
    t.heap_file_id = utilities::ReadData<file_id_t>(bytes, off);
    t.table_id = utilities::ReadData<table_id_t>(bytes, off);
    t.table_name = utilities::ReadData<std::string>(bytes, off);
    return t;
}
```

The same pattern is used for columns and types. The order of fields is fixed and shared between encode and decode, making the on-disk layout stable and easy to reason about.

# Aside: databases, catalogs, and the DB server

Everything discussed so far in this post applies to a single database. The catalog layer manages metadata within one database: tables, columns, and types stored inside that database’s heap files.\
\
Supporting multiple databases requires an additional layer of coordination. This responsibility is handled by the DB server.

## Per-database catalogs

In this design, each database corresponds to a single .db file on disk, following the same model as SQLite. Each file is managed by its own DiskManager, and therefore has its own independent catalog, buffer pool, and storage state.\
\
This means:

* each database file contains its own catalog root page
* catalog metadata is not shared across databases
* opening a different database is equivalent to opening a different file

\
The catalog layer itself is unaware of other databases. It operates entirely within the context of a single DiskManager.

## Role of the DB server

The DB server sits above the storage and catalog layers and is responsible for managing database files. Its role is intentionally narrow: create databases, delete databases, and open existing databases.\
\
On startup, the server scans a configured data directory and discovers existing database files:

```cpp
void DbServer::Init() {
  for (const auto& entry :
    std::filesystem::directory_iterator(config::DATA_PATH)) {
    if (!entry.is_regular_file()) continue;
    if (entry.path().extension() != ".db") continue;

    std::string name = entry.path().stem().string();
    _cache[name] =
      std::make_unique<storage::DiskManager>(entry.path().string());
  }
}
```

Each database is cached by name and associated with a DiskManager instance. Opening a database simply returns the corresponding disk manager, creating it lazily if necessary.

## Creating and switching databases

Creating a database creates a new .db file and associates it with a fresh DiskManager:

```cpp
bool DbServer::CreateDatabase(const std::string& db_name) {
    if (_cache.count(db_name)) return false;
    std::string path = makePath(db_name);
    if (std::filesystem::exists(path)) return false;

    auto dm = std::make_unique<storage::DiskManager>(path);
    _cache.emplace(db_name, std::move(dm));
    return true;
}
```

Once created, the database is empty and uninitialised. The first time a catalog is constructed against this disk manager, the catalog bootstrap logic described earlier will run, creating the system catalogs and writing the magic number to the root page.\
\
Switching databases is therefore just a matter of selecting a different DiskManager and constructing a new catalog instance on top of it.

# Summary

With the storage, access, and catalog layers implemented, the database now has a solid foundation. Pages can be persisted to disk, cached in memory, organised into heap files, and described using a self-contained catalog. Most importantly, the system can now understand its own structure after a restart.\
\
At this point, the database is no longer just a collection of low-level components. It has a coherent data model: tables exist as heap files, records are addressable via RIDs, and schema information is stored and recovered through the catalog. This is the minimum infrastructure required for a relational database to behave like a database rather than a storage engine.

## What can be built now

With these layers in place, I can now build a complete end-to-end prototype. A parser and query executor can be layered on top of the catalog and access layer to support basic SQL operations such as CREATE TABLE, INSERT, and SELECT.\
\
Once a working prototype exists, the focus can shift toward more advanced database concerns. A query optimiser can be introduced to reason about access paths and operator ordering, replacing sequential scans with cost-based decisions. Index structures such as B+ trees can be integrated into the access layer to accelerate both catalog and user queries.\
\
Beyond that, concurrency control and recoverability are the next major milestones. Supporting multiple concurrent transactions requires careful coordination between locking, logging, and buffer management. Recovery mechanisms such as write-ahead logging are needed to ensure durability and correctness in the presence of crashes.\
\
In the future, this database can be extended for distributed systems: replication, sharding, and coordination across multiple nodes.
