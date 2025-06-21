---
title: Building a Relational Database from Scratch in C++
published_at: 2025-06-20T16:00:00.000Z
read_time: 3
prev_post: ''
next_post: ''
excerpt: Overview
---

# Introduction

I've recently started learning C++ and decided to build a relational database from scratch. This inspiration came from Martin Kleppmann’s Designing Data-Intensive Applications (DDIA). The early chapters introduced the internal mechanics of storage engines like Bitcask, LevelDB and RocksDB. It dives into the database structures of databases: log-structured merge trees (LSM-trees) and B-trees.

This post is the first part of a series of (upcoming) posts which outlines the high-level plan, design decisions, and phased roadmap I’ve structured around this project.

# Why Build a Database?

Building one from scratch teaches:

* How write-ahead logging ensures durability
* How in-memory structures like memtables enable fast writes
* How on-disk SSTables or B-tree pages are structured and read
* How compaction or page splitting works in practice
* How concurrency, transactions, and crash recovery are implemented

It's also an excuse for me to learn C++.

# Project overview

This project is divided into four phases. As of the time of writing this post, I have yet to start on any of it.

1. **Phase 1:** Key-Value Store with LSM-Tree Storage
2. **Phase 2:** Key-Value Store with B-Tree Storage
3. **Phase 3:** Adding a relational layer
4. **Phase 4:** SQL and Query Execution

# Phase 1: Key-Value Store with LSM-Tree Storage

The first step is to build a basic key-value store using an LSM-tree storage engine, similar to LevelDB.

## Components

* **Write-Ahead Log (WAL):** Appends every write to disk for durability
* **Memtable:** An in-memory balanced tree (e.g. std::map) holding recent writes
* **SSTables:** Immutable, sorted files flushed from the memtable
* **Compactor:** Merges SSTables and drops overwritten/deleted keys

The get path checks the memtable, then recent SSTables, and so on. Each SSTable has a sparse in-memory index to reduce scan overhead. This gives me a fast, durable, and append-only key-value store.

# Phase 2 Key-Value Store with B-Tree Storage

Once the LSM version is working, I plan to add a second storage engine based on B-trees. This engine will share the same StorageEngine interface as the LSM version.

## Why B-Trees?

* Better read performance for point and range queries
* More suitable for in-place updates
* Serves as a foundation for future ACID semantics (via pages and MVCC)

## Components

The B-tree structure enables efficient lookups and range scans, with nodes aligned to page boundaries for cache and I/O efficiency.

* **BTree Nodes:** Each node stores sorted keys and child pointers
* **Pager:** Manages reading/writing pages to disk
* **Buffer Manager**: Caches pages in memory and handles eviction

# Phase 3: Adding a Relational Layer

At this point, I will build a logical layer on top of the key-value storage engine to support relational features like:

* Tables and schemas
* Row/column storage layout
* Transactions and isolation
* SQL-like APIs

This turns the storage engine into an actual database, with support for structured data and multiple tables.

## Components

This phase introduces more complex internals such as concurrency control and crash recovery at the logical level.

* **Table Abstraction:** Maps table names to key ranges or root pages
* **Catalog:** Stores schema metadata
* **Tuple Encoder:** Packs and unpacks rows into storage blocks
* **Transaction Manager:** Assigns transaction IDs and handles commits/rollbacks
* **MVCC Layer:** Supports concurrent readers and writers
* **Lock Manager or Optimistic Concurrency Control**

# Phase 4: SQL and Query Execution

Eventually, I'll add a SQL parser and basic query planner/executor. This would allow users to interact with the database using SQL.

# Project Structure

Here's a simplified view of how I’m organising the project:

```json
/src
--/ storage       # storage layer
--|--/ lsm
--|--/ btree
--/ relational    # relational logic
--/ db            # public interface layer
--/common         # logging, status, etc.
--/ utils         # file I/O, threading
/ tests
```

Each engine lives in its own folder and implements a shared StorageEngine interface. This makes it easy to switch engines or compare performance.

# Final Thoughts

Hopefully this project goes well 👍.
