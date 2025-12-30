---
title: Implementing a relational database from scratch - Storage Layer
published_at: '2025-12-27T20:00:00.000Z'
read_time: 10
prev_post: null
next_post: content/posts/Relational-Database-Implementation---Access-Layer-Heap.md
excerpt: 'Storage, Buffer Manager, Slotted Page Organisation'
---


> This blog is part of a series of posts where I document how I built a relational database from scratch in C++, following concepts from Postgresql and sqlite.\
> \
> **Summary of this post:**\
> 1\. Covers the design and implementation of the storage layer \
> 2\. Disk manager provides page-based persistent storage \
> 3\. Buffer manager caches pages in memory and manages eviction\
> 4\. Slotted Page Organisation Implementation\
> \
> **Github:** [https://github.com/raihahahan/cpp-relational-db](https://github.com/raihahahan/cpp-relational-db)

# Introduction

I was first inspired to build a database from scratch upon reading Designing Data Intensive Applications, which led me to build a simple write-optimised key-value store backed by LSM trees. Last semester, I took CS3223, an NUS module about database internals focused on the storage layer, concurrency management and recoverability. This motivated me to build a relational database from scratch.

![](/images/blog/relational-db/architecture.png)

The plan is to build the components starting from the Storage and Access layers (Files and Access, Buffer, Disk Managers), followed by the Catalog Layer, Query Evaluation Engine, Recovery Manager and finally, the Concurrency Control. As of the time of writing, the Storage, Access and Catalog layers have been implemented.

# Overview: Storage Layer

This blog will cover the implementation of the Storage Layer. This layer consists of the Disk Manager and Buffer Manager. The disk manager handles persistent storage while buffer manager acts as the in-memory cache for the database.

# Disk Manager

## Page

Instead of working with single bytes, the lowest unit of data in this system is by chunks of contiguous bytes, called pages. The size of each page is 8KB and is configurable as a compile time constant. In this database system, each database is represented as a file (e.g `mydb.db`), similar to sqlite. Each file is divided into pages as shown below:

```
Database file: mydb.db
-------------------------------------
| Page 0 | Page 1 | Page 2 | Page 3 |
-------------------------------------
   0KB     8KB      16KB     24KB

```

## Operations

Each page is identified by a page id. The operations in the disk manager are simple: `ReadPage`, `WritePage`, `AllocatePage`, `DeallocatePage`.\
\
Reading a page simply copies the bytes of a page into an 8KB buffer, keyed by its page id. Writing takes in a buffer and writes the contents of the buffer to the page in the file. Allocating a page returns the next available page id to use, while deallocating a page indicates that the page can be reused. Whether a page in the file can be used (is free) is handled by a data structure called the free list.

## Free list

The free list is an in-memory data structure that tells us which pages are safe to reuse for future allocations without losing valid database state. This is implemented with `std::vector.`\
\
On allocating a page, if the free list is not empty, then we return `free_list.back()`. Else, this means that all existing pages are in use, so we add a new page into the file (i.e the file grows monotonically). Deallocating a page does a `free_list.push_back(page_id)`.

```cpp
db::storage::page_id_t DiskManager::AllocatePage() {
  if (!free_list.empty()) {
    // free list available
    // use a current free frame instead of adding to free list
    auto id = free_list.back();
    free_list.pop_back();
    return id;
  }

  // free list empty: all existing page used
  // append a new one
  return next_page_id_++;
}

void DiskManager::DeallocatePage(page_id_t page_id) {
  free_list.push_back(page_id);
}
```

## Future improvements for Storage Manager

One limitation of the current free list implementation is space leakage across restarts. The free list is maintained purely in-memory and is not persisted to disk. So any pages that were previously deallocated are forgotten when the system restarts.\
\
On restart, `next_page_id` is initialised using `GetNumPages()`, which conservatively assumes that all existing pages on disk are allocated. This guarantees correctness, but prevents reuse of previously freed pages. Consequently, new page allocations always append to the end of the database file, causing the file to grow monotonically over time.\
\
A more complete design would persist free-page metadata on disk (e.g. using a free space map), allowing freed pages to be safely reused across restarts.

# Buffer Manager

While the disk manager provides access to pages on disk, directly reading and writing pages from disk for every operation would be prohibitively slow. The buffer manager sits between the disk manager and the higher layers of the database, acting as an in-memory cache for database pages.\
\
The buffer manager manages a fixed-size pool of memory frames, where each frame can hold exactly one page. Pages are loaded into frames on demand, and subsequent accesses to the same page can be served from memory instead of disk.

## Frame

A frame represents a single slot in the buffer pool. Each frame stores:

* the `page_id` currently loaded in the frame
* a `pin_count` indicating how many clients are currently using the page
* a dirty flag indicating whether the page has been modified
* a fixed-size data buffer of `PAGE_SIZE` bytes

\
At initialisation, all frames are empty and placed into a free list.

## Buffer pool initialisation

On construction, the buffer manager allocates a fixed number of frames, determined by `BUFFER_POOL_SIZE`. Each frame is initialised with:

* `page_id = INVALID_PAGE_ID`
* `pin_count = 0`
* `dirty = 0`
* a newly allocated data buffer

\
All frames start in the free list (note: this free list is different from the one in the Disk Manager), indicating that they are available to load pages. A replacement policy is also initialised at this point. In this implementation, the CLOCK replacement policy is used.

```cpp
BufferManager::BufferManager(ReplacementPolicyType type, IDiskManager* dm)
    : disk_(dm) {
  pool_.resize(config::BUFFER_POOL_SIZE);
  frame_ptrs_.reserve(config::BUFFER_POOL_SIZE);

  for (size_t i = 0; i < config::BUFFER_POOL_SIZE; ++i) {
    Frame* f = & pool_[i];
    frame_ptrs_.push_back(f);

    // init metadata
    f->page_id = INVALID_PAGE_ID;
    f->pin_count = 0;
    f->dirty = 0;
    f->data = new char[config::PAGE_SIZE];

    free_list_.add(f);
  }

  if (type == ReplacementPolicyType::CLOCK) {
    policy_ = std::make_unique<ClockPolicy>(frame_ptrs_);
  } else {
    throw std::runtime_error("BufferManager: Unknown replacement policy type.");
  }
};
```

## Requesting a page

The main entry point to the buffer manager is `request(page_id)`, which returns a frame containing the requested page.\
\
**Case 1: Page hit**\
\
If the requested page is already present in the buffer pool, it is a page hit.

```cpp
if (it != page_table_.end()) {
  Frame* frame = it->second;
  pin(frame);
  policy_->record_access(frame);
  return frame;
}
```

* the corresponding frame is looked up via the in-memory page table
* the frame is pinned (its pin count is incremented)
* the replacement policy is notified of the access

\
The frame is then returned directly without any disk I/O.\
\
**Case 2: Page miss**\
\
If the page is not in memory, the buffer manager must load it from disk. First, it checks whether there are free frames available.

```cpp
// case 2: p is not in some frame
// check if free list has available frames
if (!free_list_.empty()) {
  // case 2a: free list is not empty
  // 1. move some frame f' from freelist to pool
  // 2. increment pin count of f'
  // 3. read p into f'
  // 4. return f'
  frame = free_list_.get();
} else {
  frame = evict();
}
```

* if the victim frame is dirty, it is flushed to disk
* the old page-to-frame mapping is removed
* the frame metadata is reset

\
Once a frame is available, the requested page is read from disk into the frame, the page table is updated, and the frame is pinned before being returned.

```cpp
pin(frame);
read(pid, frame); // loads page + sets page_table_[pid]
policy_->record_load(frame);
return frame;
```

## Pinning and unpinning

Each frame maintains a `pin_count` that tracks how many clients are currently using the page.

* requesting a page increments the pin count
* releasing a page decrements the pin count

\
A frame with a non-zero pin count is considered in use and cannot be evicted. When a frame’s pin count drops to zero, it becomes eligible for eviction and is reported to the replacement policy. This ensures that pages currently in use are never evicted.

## Dirty pages and flushing

When a page is modified, it is marked dirty using `mark_dirty`. Dirty pages are not immediately written to disk.\
\
A dirty page is flushed to disk when:

* it is selected as an eviction victim
* `flush_all` is called

\
Flushing writes the page’s contents back to disk and clears the dirty flag.

## Eviction and replacement policies

Rather than hard-coding a specific eviction strategy into the buffer manager, the eviction logic is abstracted behind a replacement policy interface. This allows different page replacement algorithms (e.g. CLOCK, LRU, FIFO) to be plugged in without modifying the core buffer manager logic.

### Pluggable replacement policy design

The buffer manager interacts with the replacement policy exclusively through the following interface:

```cpp
class IReplacementPolicy {
  public:
    virtual ~IReplacementPolicy() = default ;
    virtual void record_access(Frame*) = 0;  // page hit
    virtual void record_load(Frame*) = 0;    // page loaded into a frame
    virtual void record_unpin(Frame*) = 0;   // frame becomes evictable
    virtual Frame* choose_victim() = 0;      // select eviction candidate
};

```

This design follows the strategy pattern, where the buffer manager delegates eviction decisions to a policy object, while remaining agnostic to the concrete algorithm being used. The buffer manager notifies the policy of key lifecycle events:

* a page is accessed (page hit)
* a page is loaded into a frame
* a frame becomes unpinned and eligible for eviction.

\
When eviction is required, the buffer manager simply calls choose\_victim(), and the policy returns a frame to evict. This separation cleanly decouples page management from replacement strategy, making the buffer manager simpler and easier to extend.

### CLOCK replacement policy

The CLOCK policy is an efficient approximation of Least Recently Used (LRU). Instead of maintaining a fully ordered list of pages, it uses a circular scan with reference bits to track recent usage.

### Data structures

The CLOCK policy maintains:

* a circular array of frame pointers
* a reference bit for each frame
* a “clock hand” that scans frames in a circular manner

\
Each frame is assigned a stable index at initialisation, allowing the policy to associate metadata (reference bits) with frames efficiently.

### Reference bits

Each frame has a reference bit that represents whether the page was accessed recently.

* a reference bit of 1 indicates recent usage
* a reference bit of 0 indicates that the page has not been used recently

\
The reference bits are updated as follows:

* on page access (hit): set to 1
* on page load: set to 1
* when a frame is unpinned: reset to 0

\
Resetting the reference bit on unpin prevents pages from being immediately evicted while still allowing them to age naturally if they are not accessed again.

### Victim selection

```cpp
Frame* ClockPolicy::choose_victim() {
  for (size_t scanned = 0; scanned < 2 * N_; ++scanned) {
    Frame* f = frames_[hand_];
    size_t idx = hand_;

    // only consider unpinned
    if (f->pin_count == 0) {
      if (ref_bits_[idx] == 0) {
        return f;
      }

      // second chance, clear ref bit
      ref_bits_[idx] = 0;
    }
    advance_hand();
  }
  // can't find frame
  return nullptr;
}
```

When eviction is required, the CLOCK policy scans frames starting from the current hand position. For each frame:

1. if the frame is pinned, it is skipped
2. if the frame is unpinned and its reference bit is 0, it is selected as the victim
3. if the frame is unpinned but its reference bit is 1, the bit is cleared and the frame is given a “second chance”

\
The clock hand advances after each inspection. If no victim is found after a full pass (or two passes in this implementation), eviction fails (another design consideration would be to keep it looping until it finds a victim, but this would cause the eviction to run unbounded). This ensures that:

* recently used pages are retained
* only unpinned pages are evicted
* eviction runs in bounded time

### Why CLOCK?

CLOCK offers a good balance between simplicity and performance. It avoids the overhead of maintaining full LRU order, requires only constant-time updates per access and performs well in practice for database workloads.

# Slotted Page Organisation

The Disk and Buffer Managers handle raw page bytes. Slotted Page provides a formal organisation of how data is stored within each page. Slotted page layout helps support inserts, deletes, and updates without requiring records to be stored contiguously.\
\
A slotted page divides a fixed-size page into three logical regions: a page header, a slot directory, and the record data area. The slot directory grows upward from the start of the page, while record data grows downward from the end of the page, leaving free space in between.

```
+-----------------------+  <- page start
| PageHeader            |
| - num_slots           |
| - free_space_offset   |
+-----------------------+
| SlotDirectory[]       | grows upward
+ ----------------------+
| FREE SPACE            |
+-----------------------+
| Record Data           | grows downward
+ ----------------------+  <- page end
```

The page header tracks the number of slots and the current free space boundary. Each slot entry stores the offset and length of a record within the page. This extra level of indirection allows records to move within the page without invalidating their slot IDs.

## Initialisation

The slotted page is initialised by taking in a buffer of 8KB representing a page and reinterpreting it as a Slotted Page.

```cpp
void SlottedPage::Init(char* page_data, uint16_t offset) {
  auto* header = reinterpret_cast<PageHeader*> (page_data + offset);
  header->num_slots = 0;
  header->free_space_offset = config:: PAGE_SIZE;
};
```

This Init is only called on a page once on allocating a new page from Disk Manager. To retrieve the slotted page organisation of a page that is already initialised, a FromBuffer method is available.

```cpp
SlottedPage SlottedPage::FromBuffer(char* page_data, uint16_t offset) {
  SlottedPage sp{ page_data, offset };
  return sp;
};
```

## CRUD operations

When inserting a record, the slotted page first checks that there is sufficient free space for both the record data and a new slot entry. The record bytes are written to the end of the page, and a new slot is appended to the slot directory. The returned slot ID serves as a stable handle to the record.

```cpp
std::optional<uint16_t> SlottedPage::Insert(const char* data, std::size_t len) {
  // required new space:
  // 1. additional slot: sizeof(Slot)
  // 2. additional data: len
  if (FreeSpace() < len + sizeof(Slot)) return std::nullopt;
  auto* header = GetHeader();

  // 1. write data to start_offset + len
  header->free_space_offset -= len;
  std::memcpy(_data + header->free_space_offset, data, len);

  // 2. create new slot
  uint16_t slot_offset = _offset + sizeof(PageHeader) +
                          header->num_slots * sizeof(Slot);
  Slot new_slot{ header->free_space_offset, static_cast<uint16_t>(len) };
  std::memcpy(_data + slot_offset, &new_slot, sizeof(Slot));
  uint16_t slot_id = header->num_slots;
  header->num_slots++;

  return slot_id;
};
```

\
Updates attempt to reuse existing space where possible. If the new record fits within the original allocation, it is overwritten in place. Otherwise, no-op. As a TODO, the record should be written to a new location within the page and the slot is updated to point to the new offset. This avoids shifting other records and keeps updates localised.

```cpp
bool SlottedPage::Update(uint16_t slot_id, const char* new_data, std::size_t len) {
  auto* header = GetHeader();
  // check if slot is valid
  if (slot_id >= header->num_slots) return false;
  auto* slot = GetSlot(slot_id);
  if (slot->length >= len) {
    // case 1: old data is larger than or equal to new data
    // if larger than, then new data will have garbage values
    std::memcpy(_data + slot->offset, new_data, len);
    slot->length = len;
  } else {
    // case 2: need to bring to new offset
    if (FreeSpace() < len) return false;

    // 1. update slot
    header->free_space_offset -= len;
    slot->offset = header->free_space_offset;
    slot->length = len;

    // 2. create data
    std::memcpy(_data + header->free_space_offset, new_data, len);
  }

  return true;
};
```

Deleting a record does not immediately reclaim space. Instead, the slot is marked as invalid by setting its length to zero. The freed space can later be reused by future inserts, keeping deletion inexpensive.

```cpp
bool SlottedPage::Delete(uint16_t slot_id) {
  auto* header = GetHeader();
  if (slot_id >= header->num_slots) return false;
  auto* slot = GetSlot(slot_id);
  slot->length = 0;
  return true;
};
```

# Summary

By separating disk I/O from in-memory page management, the buffer manager significantly improves performance while preserving correctness. Higher layers of the database interact exclusively with pages in memory, without needing to reason about disk access directly.
