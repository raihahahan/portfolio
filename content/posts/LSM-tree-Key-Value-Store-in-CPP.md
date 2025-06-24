---
title: LSM-tree Key-Value Store in C++
published_at: 2025-06-23T16:00:00.000Z
read_time: 6
prev_post: content/posts/Building-Databases-from-Scratch-in-CPP.md
next_post: ''
excerpt: LSM-Trees
---

> Github link: [https://github.com/raihahahan/cpp-kv-database](https://github.com/raihahahan/cpp-kv-database)

# Introduction

I built a simple key-value database in C++ backed by a Log-Structured Merge Tree (LSM-tree) storage engine. This project was inspired by modern storage systems like LevelDB and RocksDB, and helped me better understand how low-level databases work.\
\
The database supports:

* Key-value data operations (Put, Get, Delete)
* Write-Ahead Log (WAL) for durability and crash recovery
* In-memory Memtable using a Skiplist for efficient lookups and ordering
* SSTable Segments flushed to disk for persistence
* Compaction to merge and clean up stale data
* A simple CLI interface to interact with the database

Design Overview\
![](</images/blog/cpp-database/Screenshot 2025-06-24 at 12.39.39 PM.png>)
=========================================================================

1. On db writes, updates and deletes, the database appends to a Write Ahead log (WAL), updates the memtable, and if the WAL entries exceeds a certain threshold, flushes the memtable to an SSTable segment on disk.
2. On db reads, the database first checks the memtable, and if the key does not exist there, finds it from the SSTable segments using an index map.
3. On db startups, the database first loads an index map from the SSTable segments for efficient disk scanning, followed by a WAL replay to load non-flushed data into the memtable.
4. The compactor thread periodically compacts and merges the SSTable segments.

# Key-Value Store

At its core, the database exposes a simple API:

```cpp
db.put("name", "alan");
db.get("name");       // "alan"
db.remove("name");
```

These operations delegate to the underlying LSM Engine, which handles writes, reads, flushing, and persistence. The design is modular enough to plug in different storage engines later (e.g., B-Tree).

# Write-Ahead Log (WAL)

To ensure crash recovery, every write (put or delete) is first appended to a WAL file on disk before being applied to the in-memory store.

* On startup, the WAL is replayed to recover the latest state.
* After a flush to disk, the WAL and memtable are cleared to reduce redundancy.

\
The WAL follows the following binary format for easy serialisation and deserialisation and compact memory layout:

```
[1B  opType][4B  key size][key bytes][4B  value size][value bytes]
```

# Memtable with Skiplist

The Memtable is an in-memory structure that holds all current key-value pairs. I used a Skiplist to maintain sorted keys with fast (O(logn)) insert, delete, and search operations, ideal for LSM trees.

* All writes go to the memtable after the WAL.
* Reads first consult the memtable.
* Once it reaches a size threshold, it is flushed to disk as an SSTable

## Brief explanation on how Skiplist works

A Skiplist is a probabilistic data structure that allows fast search, insertion, and deletion operations, typically in O(log n) time.

\
It can be thought of as a multi-level linked list, where each higher level skips over more elements, allowing faster traversal:

* The bottom level is a regular sorted linked list.
* Each higher level randomly "skips" more nodes.

\
**Initial Skip List (levels: 3)**

\
We're inserting key "D".

\
Level 2:  \[HEAD] ──────────────▶ \[G]\
Level 1:   \[HEAD] ───▶ \[C] ─────▶ \[G]\
Level 0:  \[HEAD] ─▶ \[A] ─▶ \[C] ─▶ \[E] ─▶ \[G]

\
**Step 1: Traverse and fill update\[]**

\
We have an internal `update[i]` list that stores the last node at level i whose forward pointer might need to be updated when inserting a new node. \
\
We want to find where "D" should be inserted. We’ll go top-down to find the rightmost node \<= "D" at each level.

\
At level 2:

* HEAD → G (G > D) → stop. update\[2] = HEAD

\
At level 1:

* HEAD → C (C \< D), but C → G (G > D) → stop. update\[1] = C

\
At level 0:

* HEAD → A (A \< D) → C (C \< D) → E (E > D) → stop. update\[0] = C

\
Now:\
update\[2] = HEAD\
update\[1] = C\
update\[0] = C\
\
**Step 2: Randomly pick a level for "D"**

\
Let’s say we randomly pick level 2. Then we insert "D" at levels 0 and 1.

\
**Step 3: Create the node and splice it in**

\
`newNode = Node("D", 2);`

\
Now link `newNode` into the skip list

```cpp
for (int i = 0; i < 2; ++i) {
  newNode->forward[i] = update[i]->forward[i];
  update[i]->forward[i] = newNode;
}
```

\
Final Skip List\
Level 2:   \[HEAD] ──────────────▶ \[G]\
Level 1:   \[HEAD] ───▶ \[C] ─▶ \[D] ─▶ \[G]\
Level 0:   \[HEAD] ─▶ \[A] ─▶ \[C] ─▶ \[D] ─▶ \[E] ─▶ \[G]

# SSTable Segments

When the Memtable reaches a certain threshold, its contents are flushed to disk as a new Sorted String Table (SSTable) file. Each SSTable:

* Is immutable once written
* Contains sorted key-value pairs
* Has an in-memory index map that stores mappings of key: (filename, byte offset) for fast random access

\
This design allows us to efficiently locate and read values directly from disk without scanning entire files.

## Index map for fast disk seek

![](</images/blog/cpp-database/Screenshot 2025-06-24 at 12.24.04 PM.png>)

An index map is created that maps each key to a (filename, byte offset) pair.

1. On flush: Create a new index map and file, and for each key in the memtable, add index\_map\[key] = { filename, byte offset } as we write into disk sequentially.
2. On read: From the index map, we can find the latest SSTable segment file the key exists in, along with its byte offset, allowing for efficient lookup.
3. On db startup: On startup, the index map needs to be re-created. The db scans through every segment file, finds the offset for each key and updates the index map.

## Binary protocol for the SSTable

The SSTable data is stored with the following format:

```
<keySize><key-data><valueSize><value-data>
```

\
That way, it knows when to stop reading for each key-value pair:

```cpp
std::optional<std::string> SegmentManager::get(const std:: string& key) const {
  auto it = indexMap.find(key);
  if (it == indexMap.end()) return std:: nullopt;
  const auto& [filepath, offset] = it -> second;
  std:: ifstream in (filepath, std:: ios::binary);
  if (!in) return std:: nullopt;

  // seek to stored offset for the key inside the filepath
  in.seekg(offset);
  uint32_t kSize, vSize;

  in.read(reinterpret_cast <char*> (&kSize), sizeof(kSize));
  in.ignore(kSize);
  in.read(reinterpret_cast <char*> (&vSize), sizeof(vSize));

  std::string value(vSize, '\0');
  in.read(&value[0], vSize);

  return value;
}
```

## Duplicate Keys and Latest Value Resolution

Since every flush creates a new SSTable file, it's possible (and expected) that the same key appears in multiple segments—this happens every time a key is updated.\
\
Rather than scanning all segments blindly, our index map always gets updated with the latest offset each time a new flush occurs. So even though old versions of the key exist in older segments, reads always return the latest value because:

* The index map is overwritten with the newest (filename, offset)
* We only seek to the most recent file+offset pair for any key

\
This approach keeps writes simple and fast—but does leave obsolete data lying around.

## Solving Duplicates: Compaction

To clean up these old duplicates and reclaim space, we periodically run compaction. More details in the section below on Compaction.

# Compaction and Merging

To reduce the number of SSTables and delete obsolete entries, the system performs periodic compaction:

* Merge overlapping SSTables into one
* Discard deleted or overwritten keys
* Rebuild a new SSTable file

\
This runs as a background thread that periodically does the compaction and merging. This keeps the storage efficient and read performance fast.\
\
**Below is a high-level overview of the algorithm:**\
\
1\. Read all entries from index map

2\. Sort and deduplicate by key, keeping latest entry for each key

3\. Write to a new compacted segment file

4\. Rebuild a new index map

5\. Delete all old segment files

## Compaction

![](</images/blog/cpp-database/Screenshot 2025-06-24 at 12.28.59 PM.png>)

The diagram above shows a single segment containing multiple entries of the same key (e.g. ben, charlie). During compaction, we scan through the segment and retain only the most recent value for each key. This reduces storage waste and speeds up reads by removing outdated versions.

## Merging

![](</images/blog/cpp-database/Screenshot 2025-06-24 at 12.32.29 PM.png>)

When multiple segments exist, we need to merge them together to maintain query performance and disk efficiency.\
\
In the second diagram:

* Segment 1 has older data
* Segment 2 is newer and contains updates to some keys (alan, ben) and new keys (alex, tom)

\
Merging performs a k-way merge (like merge sort), always preferring values from newer segments when duplicates are found. This results in a single clean segment with only the latest values for all keys.

# CLI Interface

The CLI provides an interactive shell to issue commands like:

```
> put name banana
> get name
banana
> del name
```

It uses the Command design pattern, where each operation is encapsulated into a class like PutCommand, GetCommand, and RemoveCommand.

# Future Work

This project lays the foundation for more advanced database features. Some ideas I'm considering:

* Add Bloom Filters to avoid unnecessary disk lookups
* Configurable flush threshold based on memory size
* Support for a B-Tree storage engine to enable SQL-style range queries
* Host the database as a long-running process (like PostgreSQL) and interact via socket or custom CLI
