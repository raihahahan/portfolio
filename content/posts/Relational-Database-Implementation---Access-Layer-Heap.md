---
title: Relational Database Implementation - Access Layer
published_at: 2025-12-28T20:00:00.000Z
read_time: 6
prev_post: >-
  content/posts/Implementing-a-relational-database-from-scratch---Storage-Layer.md
next_post: content/posts/Relational-Database-Implementation---Catalog.md
excerpt: Heap Files
---

> This blog is part of a series of posts where I document how I built a relational database from scratch in C++, following concepts from Postgresql and sqlite. (Start from [here](/blog/Implementing-a-relational-database-from-scratch---Storage-Layer))\
> \
> Summary of this post: \
> 1\. Heap file implementation\
> 2\. Heap file iterator implementation\
> \
> Github: [https://github.com/raihahahan/cpp-relational-db](https://github.com/raihahahan/cpp-relational-db)

# Introduction

The access layer sits above the storage layer and is responsible for defining how records are organised and accessed on disk. While the storage layer deals with pages, frames, and persistence, the access layer introduces higher-level abstractions such as files, records, and iterators.\
\
In a relational database, the access layer typically includes multiple access methods. In this implementation, the focus is on heap files, which provide an unordered collection of records. In the future, this layer can be extended to include other access methods such as B+ trees and hash indexes, which support efficient lookup and range queries.\
\
This post covers the design and implementation of:

* heap files, which store records across multiple pages
* heap iterators, which allow sequential scans over heap files

# Heap file

A heap file represents a table of records. It is the simplest access method for storing records. Records are stored in no particular order and are appended wherever space is available. This makes heap files efficient for inserts, but requires a full scan for lookups unless an index is added on top. \
\
In this design, a heap file consists of:

* a linked list of heap pages
* each heap page internally organised using a slotted page layout

## Heap page layout

Each heap page begins with a small heap-specific header, followed by a slotted page structure.

```cpp
struct HeapPageHeader {
  page_id_t next_page_id;
};    

```

The `next_page_id` field links heap pages together, forming a singly linked list. This allows the heap file to grow dynamically as more records are inserted.\
\
After the heap page header, the rest of the page is managed by the slotted page abstraction. The slotted page handles variable-length records and slot management, while the heap file logic focuses on page chaining and record-level operations.\
\
Heap pages are initialised as follows:

```cpp
void HeapFile:: InitHeapPage(char* raw_page) {
  auto* heap_hdr = reinterpret_cast<HeapPageHeader*>(raw_page);
  heap_hdr->next_page_id = INVALID_PAGE_ID;
  SlottedPage::Init(raw_page, sizeof(HeapPageHeader));
}
```

## Record identifier (RID)

Each record in a heap file is uniquely identified by a record identifier (RID):

```cpp
struct RID {
  page_id_t page_id;
  uint16_t slot_id;
};
```

The `page_id` identifies the heap page, while the `slot_id` identifies the record within that page’s slotted page structure. Together, they provide a stable handle to a record, independent of its physical location within the page.

## Heap file operations

### Get

To retrieve a record, the heap file:

1. fetches the page containing the record
2. accesses the slotted page within the heap page
3. retrieves the record by slot ID

```cpp
std::optional<Record>HeapFile::Get(const RID& rid) {
  auto* frame = _bm->request(rid.page_id);
  auto sp = SlottedPage::FromBuffer(frame->data, sizeof(HeapPageHeader));
  auto data = sp.Get(rid.slot_id);
  _bm->release(rid.page_id);
  
  if (data.has_value()) {
    return Record{rid, (*data).first.data(), (*data).second};
  }
  return std::nullopt;
}
```

This operation runs in constant time given a valid RID.

### Insert

Inserting a record into a heap file proceeds as follows:

1. if the heap file has no pages yet, allocate and initialise the first heap page
2. traverse the linked list of heap pages
3. attempt to insert the record into each page
4. if no page has enough free space, allocate a new heap page and append it to the list

```cpp
std::optional<RID> HeapFile::Insert(const char* data, size_t len) {
  page_id_t page_id = _first_page_id;
  page_id_t last_page_id = INVALID_PAGE_ID;

  while (page_id != INVALID_PAGE_ID) {
    Frame* frame = _bm->request(page_id);
    auto sp = SlottedPage::FromBuffer(frame->data, sizeof(HeapPageHeader));

    auto slot_id = sp.Insert(data, len);
    if (slot_id.has_value()) {
        _bm->mark_dirty(frame);
        _bm->release(page_id);
        return RID{page_id, *slot_id};
    }

    auto* hdr = reinterpret_cast<HeapPageHeader*>(frame->data);
    _bm->release(page_id);
    last_page_id = page_id;
    page_id = hdr->next_page_id;
  }

  // allocate and link a new heap page
  page_id_t new_page_id = _dm->AllocatePage();
  Frame* last = _bm->request(last_page_id);
  reinterpret_cast<HeapPageHeader*>(last->data)->next_page_id = new_page_id;
  _bm->mark_dirty(last);
  _bm->release(last_page_id);

  Frame* frame = _bm->request(new_page_id);
  InitHeapPage(frame->data);
  _bm->mark_dirty(frame);

  auto sp = SlottedPage::FromBuffer(frame->data, sizeof(HeapPageHeader));
  auto slot_id = sp.Insert(data, len);
  _bm->release(new_page_id);

  if (slot_id.has_value()) {
      return RID{new_page_id, *slot_id};
  }

  // future work: TOAST / overflow storage
  return std::nullopt;
}
```

This design keeps insertion simple and avoids any global ordering constraints.

### Update and delete

Updating and deleting records are delegated to the slotted page, using the record’s RID. Deleting a record simply frees its slot and the space may later be reused by the slotted page.

## Heap iterator

While RIDs allow direct access to records, many database operations (e.g. sequential scans) require iterating over all records in a heap file. This is handled by the heap iterator.\
\
The heap iterator traverses:

1. heap pages in page order
2. slots within each page, skipping deleted entries

### Iterator state

The iterator maintains:

* the current page ID
* the current slot index
* a pointer to the heap file
* a boolean indicating whether a next record exists

### Advancing the iterator

The core logic of the iterator is implemented in Advance(). It scans slots within the current page, and when exhausted, follows the `next_page_id` pointer to the next heap page.

```cpp
void HeapIterator::Advance() {
    _has_next = false;

    while (_curr_page != INVALID_PAGE_ID) {
        storage::Frame* frame = _heap->GetBm()->request(_curr_page);
        auto sp = SlottedPage::FromBuffer(frame->data, sizeof(HeapPageHeader));

        while (_curr_slot < sp.GetNumSlots()) {
            if (sp.Get(_curr_slot).has_value()) {
                _has_next = true;
                _heap->GetBm()->release(_curr_page);
                return;
            }
            _curr_slot++;
        }

        auto* hdr = reinterpret_cast<HeapPageHeader*>(frame->data);
        page_id_t next = hdr->next_page_id;

        _heap->GetBm()->release(_curr_page);
        _curr_page = next;
        _curr_slot = 0;
    }
}

```

This ensures that:

* deleted records are skipped
* pages are traversed lazily
* buffer manager pins are correctly balanced

### Using the iterator

The heap file exposes standard `begin()` and `end()` methods:

```cpp
HeapIterator HeapFile::begin() {
  if (_first_page_id == INVALID_PAGE_ID) {
    return end();
  }
  return HeapIterator(this, _first_page_id, 0, true);
}

HeapIterator HeapFile:: end() {
  return HeapIterator(this, INVALID_PAGE_ID, 0, false);
}

```

This allows heap files to be scanned using a familiar iterator interface:

```cpp
Record HeapIterator::operator*() {
    RID rid{_curr_page, _curr_slot};
    return _heap->Get(rid).value();
}

HeapIterator& HeapIterator::operator++() {
    if (!_has_next) return *this;
    _curr_slot++;
    Advance();
    return *this;
}

// usage
for (auto it = hf.begin(); it != it.end(); ++it) {
  auto rec = *it;
}
```

# Future work

Heap files provide a simple and flexible storage format, but they do not support efficient lookups or range queries. In future iterations, this access layer can be extended with:

* B+ tree indexes for ordered access and range scans
* hash indexes for fast equality lookups
* integration with the catalog to map tables to heap files
* support for large values via overflow storage ([TOAST-style](https://www.crunchydata.com/blog/postgres-toast-the-greatest-thing-since-sliced-bread) design)

\
These access methods can reuse the same underlying storage and buffer management infrastructure, while providing different performance trade-offs.
