# VCS (Version Control System) — Explanation

This document describes the Version Control System implemented in the Rule Engine Backend. The VCS stores **JSON content** in **blobs**, organizes them in **trees**, tracks history with **commits** and **branches**, and supports **merge requests** and **diff** between versions.

---

## 1. Overview

The VCS is designed to version **rule-engine content** (and any JSON) in a Git-like way:

- **Blob** — Immutable storage for one JSON value. Identified by a content hash (SHA-256) for deduplication.
- **Tree** — A snapshot of a “directory”: a list of **entries**, each pointing to a **blob** (file) or a **child tree** (subdirectory).
- **Commit** — A snapshot of the whole repo at a point in time: it points to one **tree** and optionally to a **parent commit**, forming a history chain.
- **Branch** — A named pointer to a **head commit**. The default branch is often `main`.
- **Merge request** — A request to merge one branch (source) into another (target), with optional comments and status (OPEN, MERGED, CLOSED).
- **Diff** — Comparison between two trees (or two commits, or two branch heads) to see added, removed, and modified blob paths.

All VCS entities are scoped to a **repository**. The implementation lives under `src/modules/vcs-engine/` and is exposed via the REST API (see [API.md](./API.md)).

---

## 2. Architecture

### 2.1 High-level flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Blob      │────▶│   Tree      │────▶│   Commit    │────▶│   Branch    │
│ (JSON data) │     │ (entries)   │     │ (history)   │     │ (head ref)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │                    │
       │                    │                    │                    │
       └────────────────────┴────────────────────┴────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │  Merge request      │
                          │  (source → target)  │
                          └─────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────────┐
                          │  Diff (trees/        │
                          │  commits/branches)   │
                          └─────────────────────┘
```

1. **Content** is stored as JSON in **blobs**. Each blob has a `contentHash` (SHA-256 of a stable JSON string). Same content ⇒ same hash ⇒ one blob (deduplication).
2. **Trees** reference blobs and nested trees via **tree entries** (name + type BLOB/TREE + blobId or childTreeId).
3. **Commits** reference a single tree and an optional parent commit, building a linear (or merge) history.
4. **Branches** point to a commit (head). Creating a new commit and updating the branch head advances the branch.
5. **Merge requests** link source and target branches; **diff** compares their heads (or any two commits/trees) to show changes.

### 2.2 Module layout

| Module / file        | Responsibility |
|----------------------|----------------|
| `blob.service.ts`    | Create blob from JSON; get by id or by (repositoryId, contentHash); list by repository. Computes content hash. |
| `tree.service.ts`    | Create tree with optional entries; get by id; add entry; list by repository. |
| `commit.service.ts`  | Create commit (tree, parent, author, message); get by id; list by repository or by branch. |
| `branch.service.ts`  | Create branch; get by id or (repositoryId, name); list by repository; update head commit. |
| `diff.service.ts`    | Diff two trees; diff two commits (via their trees); diff two branch heads. Returns added/removed/modified paths with blob refs. |
| `merge.service.ts`   | Create/list/update merge requests; merge (set status, mergedBy, mergedCommitId); comments. |

Data is persisted via **Prisma** and the **Blob**, **Tree**, **TreeEntry**, **Commit**, **Branch**, **MergeRequest**, and **MergeRequestComment** models (see `src/databases/models/schema.prisma`).

---

## 3. Core concepts

### 3.1 Blob

- **Purpose:** Store one JSON value (e.g. a rule set, config, or nested object).
- **Fields (conceptual):** `id`, `repositoryId`, `contentHash`, `content` (JSON), `createdAt`.
- **Content hash:** SHA-256 of a stable string form of the JSON (e.g. keys sorted so that identical content always yields the same hash). Used to deduplicate: if the same JSON is “created” again, the existing blob is reused (`repositoryId` + `contentHash` unique).
- **Immutability:** Content is not updated in place; a change produces a new blob (and new hash).

### 3.2 Tree and tree entries

- **Purpose:** Represent a snapshot of “files and folders” at a point in time.
- **Tree** has many **entries**. Each entry has:
  - **name** — e.g. file or folder name.
  - **type** — `BLOB` (file) or `TREE` (subdirectory).
  - **blobId** — Set when type is BLOB; references one blob.
  - **childTreeId** — Set when type is TREE; references another tree.

Paths are implicit: e.g. entry `rules` of type TREE with child tree containing entry `main.json` of type BLOB ⇒ path `rules/main.json`. The diff layer walks trees recursively and builds path → blob ref maps.

### 3.3 Commit

- **Purpose:** One node in the history; points to a full tree and optionally to a parent commit.
- **Fields (conceptual):** `id`, `repositoryId`, `treeId`, `parentCommitId`, `mergeParentCommitId`, `message`, `authorId`, `createdAt`.
- **History:** Following `parentCommitId` (and optionally `mergeParentCommitId` for merges) gives the history. The **branch** points to the latest commit (head) on that branch.

### 3.4 Branch

- **Purpose:** Named reference to the “current” commit (head) for a line of work.
- **Fields (conceptual):** `id`, `repositoryId`, `name`, `headCommitId`, `createdBy`, `createdAt`.
- **Updating head:** When a new commit is created (e.g. after editing blobs and trees), the branch head is updated to that commit (e.g. via `PATCH branches/:id/head`). Branch names are unique per repository.

### 3.5 Merge request

- **Purpose:** Request to integrate **source** branch into **target** branch, with metadata and discussion.
- **Fields (conceptual):** `repositoryId`, `sourceBranchId`, `targetBranchId`, `title`, `description`, `status` (OPEN | MERGED | CLOSED), `createdBy`, `mergedBy`, `mergedCommitId`, timestamps.
- **Merge:** “Merging” the MR means recording who merged and which commit represents the merge (e.g. a merge commit with two parents), and setting status to MERGED. The actual creation of that merge commit and update of the target branch head is done by the client or by other services using the commit/branch APIs.

### 3.6 Diff

- **Purpose:** Compare two versions (two trees, or two commits, or two branch heads) and report what changed.
- **Process:**
  1. For each side, recursively walk the tree and build a map: **path → { blobId, contentHash }** (only blob entries; nested trees are traversed to get blob paths).
  2. Compare the two maps:
     - **Added** — Paths only in the “target” side.
     - **Removed** — Paths only in the “base” side.
     - **Modified** — Paths in both but with different `contentHash`.
- **Paths:** Use `/` for nesting (e.g. `rules/main.json`). This matches the tree hierarchy (entry names joined by `/`).
- **APIs:** Diff can be requested:
  - Between two commits: `GET merge-requests/diff/commits?baseCommitId=...&targetCommitId=...`
  - Between two branch heads: `GET merge-requests/diff?repositoryId=...&baseBranch=...&targetBranch=...`
  - For a merge request: `GET merge-requests/:id/diff` (base = target branch head, target = source branch head).

---

## 4. Typical workflows

### 4.1 Saving a new version of rule JSON

1. **Create or reuse blob:** `POST /blobs/` with `repositoryId` and `content` (your JSON). Server hashes content and either creates a new blob or returns the existing one (same hash).
2. **Create or update tree:** Create a tree that has an entry pointing to that blob (e.g. `rules.json` → blobId). If you already have a tree, you can add an entry with `POST /trees/:id/entries` (or create a new tree with the new entry set).
3. **Create commit:** `POST /commits/` with `repositoryId`, `treeId`, `authorId`, and optionally `parentCommitId` (current head of the branch).
4. **Update branch head:** `PATCH /branches/:id/head` with the new commit id so the branch points to this new snapshot.

### 4.2 Creating and merging a merge request

1. **Create MR:** `POST /merge-requests/` with `sourceBranchId`, `targetBranchId`, `title`, `description?`, `createdBy`, `repositoryId`.
2. **Review changes:** `GET /merge-requests/:id/diff` to see added/removed/modified paths (and optionally fetch blob contents by id for details).
3. **Discuss:** `POST /merge-requests/:id/comments` to add comments; `GET /merge-requests/:id/comments` to list them.
4. **Merge:** After creating the merge commit (using commit/tree/blob APIs) and updating the target branch head, call `POST /merge-requests/:id/merge` with `mergedBy` and `mergedCommitId` to mark the MR as merged.

### 4.3 Comparing two branches or commits

- **Branches:** `GET /merge-requests/diff?repositoryId=...&baseBranch=main&targetBranch=feature-x`. Result: added, removed, modified paths from `main` to `feature-x`.
- **Commits:** `GET /merge-requests/diff/commits?baseCommitId=...&targetCommitId=...`. Same shape; useful when you have specific commit ids.
- **For an MR:** `GET /merge-requests/:id/diff` uses the MR’s target branch as base and source branch as target, so you see “what this MR would change.”

---

## 5. Data model (database)

Relevant Prisma models (see `schema.prisma`):

- **Blob** — `id`, `repositoryId`, `contentHash`, `content` (Json?), `createdAt`. Unique on `(repositoryId, contentHash)`.
- **Tree** — `id`, `repositoryId`, `createdAt`. Has many **TreeEntry**.
- **TreeEntry** — `id`, `treeId`, `name`, `type` (BLOB | TREE), `blobId?`, `childTreeId?`. Unique on `(treeId, name)`.
- **Commit** — `id`, `repositoryId`, `treeId`, `parentCommitId?`, `mergeParentCommitId?`, `message?`, `authorId`, `createdAt`.
- **Branch** — `id`, `repositoryId`, `name`, `headCommitId?`, `createdBy`, `createdAt`. Unique on `(repositoryId, name)`.
- **MergeRequest** — `id`, `repositoryId`, `sourceBranchId`, `targetBranchId`, `title`, `description?`, `status`, `createdBy`, `mergedBy?`, `mergedCommitId?`, timestamps.
- **MergeRequestComment** — `id`, `mergeRequestId`, `userId`, `comment`, `createdAt`.

Repositories, workspaces, and users are defined in the same schema; the VCS uses `repositoryId` and `authorId`/`createdBy`/`mergedBy`/`userId` to tie to the rest of the app.

---

## 6. Summary

| Concept      | Role in VCS |
|-------------|-------------|
| **Blob**    | Stores one JSON value; content-addressed (hash) for dedup. |
| **Tree**    | Snapshot of entries (blobs and nested trees); represents “directory” state. |
| **Commit** | Snapshot of repo (one tree) + link to parent(s); forms history. |
| **Branch** | Named head commit; updated when new commits are made. |
| **Merge request** | Request to merge source branch into target; status and comments. |
| **Diff**   | Compare two trees/commits/branches → added, removed, modified paths (with blob refs). |

The VCS lives in `src/modules/vcs-engine/` and is exposed via the endpoints documented in [API.md](./API.md). All persistent state is stored in the Blob, Tree, TreeEntry, Commit, Branch, MergeRequest, and MergeRequestComment tables.
