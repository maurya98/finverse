# API Documentation

REST API reference for the Rule Engine Backend. All endpoints return JSON.

---

## Response format

### Success

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional short message"
}
```

- **data** — Present when the response includes a payload.
- **message** — Optional human-readable message (e.g. "Blob created").

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "path": "fieldName", "message": "Validation message" }
  ]
}
```

- **errors** — Optional; used for validation failures (e.g. invalid body or query).

---

## Base URL and route prefixes

| Prefix | Resource |
|--------|----------|
| `auth/` | Authentication |
| `users/` | Users |
| `workspaces/` | Workspaces (owner-scoped) |
| `repositories/` | Repositories (creates default branch `main`) |
| `blobs/` | VCS blobs (JSON content) |
| `trees/` | VCS trees |
| `commits/` | VCS commits |
| `branches/` | VCS branches |
| `merge-requests/` | Merge requests and diff |
| `execute/` | Execute index.json decision |
| `simulate/` | Simulate a decision graph |

Example: `POST http://localhost:3000/blobs/` creates a blob.

---

## Authentication

### POST `auth/login`

Authenticate with email and password.

**Request body**

| Field    | Type   | Required | Description        |
|----------|--------|----------|--------------------|
| email    | string | Yes      | Valid email        |
| password | string | Yes      | Min length 8       |

**Success (200)** — `data` contains login result (e.g. user + token).

**Errors**

- `400` — Validation failed (invalid email/password format).
- `401` — Invalid email or password.

**Example**

```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response
{ "success": true, "data": { "user": { ... }, "token": "..." } }
```

---

### POST `auth/logout`

Invalidate the current session/token.

**Request**

- Body: `{ "token": "..." }` **or**
- Header: `Authorization: Bearer <token>`

**Success (200)** — `message`: "Logged out successfully".

---

## Users

### GET `users/`

List users with pagination.

**Query**

| Param | Type   | Required | Default | Description      |
|-------|--------|----------|---------|------------------|
| skip  | number | No       | 0       | Offset           |
| take  | number | No       | 50      | Limit (1–100)    |

**Success (200)** — `data`: array of user objects (no password).

---

### GET `users/:id`

Get a user by ID.

**Path**

- `id` — User UUID.

**Success (200)** — `data`: user object.

**Errors** — `404` if not found.

---

### POST `users/`

Create a user.

**Request body**

| Field    | Type   | Required | Description        |
|----------|--------|----------|--------------------|
| email    | string | Yes      | Valid email        |
| password | string | Yes      | Min length 8       |
| name     | string | No       | Optional name      |
| role     | string | No       | ADMIN, MAINTAINER, DEVELOPER, VIEWER |

**Success (201)** — `data`: created user (no password).

**Errors** — `409` if email already exists.

---

### PATCH `users/:id`

Update a user (e.g. name, role).

**Path** — `id`: user UUID.

**Request body** — `name?`, `role?` (partial update).

**Success (200)** — `data`: updated user.

**Errors** — `404` if not found.

---

### DELETE `users/:id`

Delete a user.

**Path** — `id`: user UUID.

**Success (200)** — No `data`; optional `message`.

**Errors** — `404` if not found.

---

## Workspaces

### POST `workspaces/`

Create a workspace.

**Request body:** `{ "name": string, "ownerId": string }` (UUID)

**Success (201)** — `data`: `{ id, name, ownerId, createdAt }`.

### GET `workspaces/list?ownerId=...&skip=&take=`

List workspaces by owner.

**Success (200)** — `data`: array of workspaces.

### GET `workspaces/:id`

Get workspace by ID.

**Success (200)** — `data`: workspace.

**Errors** — `404` if not found.

---

## Repositories

### POST `repositories/`

Create a repository. Creates a default branch (e.g. `main`) with no head commit.

**Request body:** `{ "name": string, "workspaceId": string (UUID), "createdBy": string (UUID), "defaultBranch"?: string }`

**Success (201)** — `data`: repository.

**Errors** — `409` if name already exists in workspace.

### GET `repositories/list?workspaceId=...&skip=&take=`

List repositories in a workspace.

**Success (200)** — `data`: array of repositories.

### GET `repositories/:id`

Get repository by ID.

**Success (200)** — `data`: repository.

**Errors** — `404` if not found.

---

## Blobs (VCS)

Blobs store **JSON content** per repository. Content is hashed (SHA-256) for deduplication; identical JSON reuses the same blob.

### POST `blobs/`

Create a blob (or reuse existing by content hash).

**Request body**

| Field         | Type   | Required | Description                    |
|---------------|--------|----------|--------------------------------|
| repositoryId  | string | Yes      | Repository UUID                |
| content       | any    | Yes      | Arbitrary JSON (object/array)  |

**Success (201)** — `data`: blob with `id`, `repositoryId`, `contentHash`, `content`, `createdAt`.

**Example**

```json
// Request
{
  "repositoryId": "repo-uuid",
  "content": { "rules": [{ "id": "r1", "condition": "amount > 100" }] }
}

// Response
{
  "success": true,
  "data": {
    "id": "blob-uuid",
    "repositoryId": "repo-uuid",
    "contentHash": "a1b2c3...",
    "content": { "rules": [...] },
    "createdAt": "2025-02-14T..."
  },
  "message": "Blob created"
}
```

---

### GET `blobs/list`

List blobs in a repository.

**Query**

| Param        | Type   | Required | Default | Description   |
|--------------|--------|----------|---------|---------------|
| repositoryId | string | Yes      | —       | Repository UUID |
| skip         | number | No       | 0       | Offset        |
| take         | number | No       | 50      | Limit (1–100) |

**Success (200)** — `data`: array of blobs.

---

### GET `blobs/by-hash`

Get a blob by repository and content hash.

**Query**

| Param        | Type   | Required | Description      |
|--------------|--------|----------|------------------|
| repositoryId | string | Yes      | Repository UUID  |
| contentHash  | string | Yes      | SHA-256 hex      |

**Success (200)** — `data`: blob.

**Errors** — `400` if params missing; `404` if not found.

---

### GET `blobs/:id`

Get a blob by ID.

**Path** — `id`: blob UUID.

**Success (200)** — `data`: blob.

**Errors** — `404` if not found.

---

## Trees (VCS)

Trees group **entries** (blobs or nested trees) to represent a directory-like snapshot.

### POST `trees/`

Create a tree, optionally with initial entries.

**Request body**

| Field        | Type  | Required | Description                                  |
|--------------|-------|----------|----------------------------------------------|
| repositoryId | string| Yes      | Repository UUID                              |
| entries      | array | No       | Array of `{ name, type, blobId?, childTreeId? }` |

- **name** — Entry name (e.g. file or folder name).
- **type** — `"BLOB"` or `"TREE"`.
- **blobId** — Required when `type === "BLOB"`.
- **childTreeId** — Required when `type === "TREE"`.

**Success (201)** — `data`: tree with `id`, `repositoryId`, `createdAt`, `entries`.

**Example**

```json
// Request
{
  "repositoryId": "repo-uuid",
  "entries": [
    { "name": "rules.json", "type": "BLOB", "blobId": "blob-uuid" }
  ]
}
```

---

### GET `trees/list`

List trees in a repository.

**Query**

| Param        | Type   | Required | Default | Description   |
|--------------|--------|----------|---------|---------------|
| repositoryId | string | Yes      | —       | Repository UUID |
| skip         | number | No       | 0       | Offset        |
| take         | number | No       | 50      | Limit (1–100) |

**Success (200)** — `data`: array of trees with entries.

---

### GET `trees/:id`

Get a tree by ID.

**Path** — `id`: tree UUID.

**Success (200)** — `data`: tree with entries.

**Errors** — `404` if not found.

---

### POST `trees/:id/entries`

Add one entry to an existing tree.

**Path** — `id`: tree UUID.

**Request body**

| Field       | Type   | Required | Description              |
|-------------|--------|----------|--------------------------|
| name        | string | Yes      | Entry name               |
| type        | string | Yes      | `"BLOB"` or `"TREE"`     |
| blobId      | string | No       | Required if type BLOB     |
| childTreeId | string | No       | Required if type TREE     |

**Success (200)** — `data`: updated tree with all entries.

**Errors** — `404` if tree not found.

### DELETE `trees/:id/entries/:entryId`

Remove an entry from a tree.

**Path** — `id`: tree UUID; `entryId`: tree entry UUID.

**Success (200)** — `data`: updated tree.

**Errors** — `404` if tree or entry not found.

### PATCH `trees/:id/entries/:entryId`

Update an entry (e.g. rename or change blob/tree reference).

**Path** — `id`: tree UUID; `entryId`: entry UUID.

**Request body** — `{ "name"?: string, "blobId"?: string | null, "childTreeId"?: string | null }`

**Success (200)** — `data`: updated tree.

**Errors** — `404` if tree or entry not found.

---

## Commits (VCS)

Commits point to a **tree** and optionally to a **parent commit**, forming history.

### POST `commits/`

Create a commit.

**Request body**

| Field              | Type   | Required | Description           |
|--------------------|--------|----------|-----------------------|
| repositoryId       | string | Yes      | Repository UUID       |
| treeId             | string | Yes      | Tree UUID             |
| authorId           | string | Yes      | User UUID             |
| message            | string | No       | Commit message        |
| parentCommitId     | string | No       | Previous commit       |
| mergeParentCommitId| string | No       | For merge commits     |

**Success (201)** — `data`: commit with `id`, `repositoryId`, `treeId`, `parentCommitId`, `mergeParentCommitId`, `message`, `authorId`, `createdAt`.

---

### GET `commits/list`

List commits, optionally for a branch.

**Query**

| Param        | Type   | Required | Default | Description    |
|--------------|--------|----------|---------|----------------|
| repositoryId | string | Yes      | —       | Repository UUID |
| branch       | string | No       | —       | Branch name    |
| skip         | number | No       | 0       | Offset         |
| take         | number | No       | 50      | Limit (1–100)  |

- Without `branch`: list recent commits in the repository.
- With `branch`: list commits along that branch’s history from its head.

**Success (200)** — `data`: array of commits.

---

### GET `commits/:id`

Get a commit by ID.

**Path** — `id`: commit UUID.

**Success (200)** — `data`: commit.

**Errors** — `404` if not found.

---

## Branches (VCS)

Branches have a **name** and an optional **head commit** (latest commit on the branch).

### POST `branches/`

Create a branch.

**Request body**

| Field         | Type   | Required | Description        |
|---------------|--------|----------|--------------------|
| repositoryId  | string | Yes      | Repository UUID    |
| name          | string | Yes      | Branch name        |
| createdBy     | string | Yes      | User UUID          |
| headCommitId  | string | No       | Initial head commit|

**Success (201)** — `data`: branch with `id`, `repositoryId`, `name`, `headCommitId`, `createdBy`, `createdAt`.

**Errors** — `409` if branch name already exists in the repository.

---

### GET `branches/list`

List branches in a repository.

**Query**

| Param        | Type   | Required | Default | Description   |
|--------------|--------|----------|---------|---------------|
| repositoryId | string | Yes      | —       | Repository UUID |
| skip         | number | No       | 0       | Offset        |
| take         | number | No       | 50      | Limit (1–100) |

**Success (200)** — `data`: array of branches.

---

### GET `branches/by-name`

Get a branch by repository and name.

**Query**

| Param        | Type   | Required | Description   |
|--------------|--------|----------|---------------|
| repositoryId | string | Yes      | Repository UUID |
| name         | string | Yes      | Branch name    |

**Success (200)** — `data`: branch.

**Errors** — `400` if params missing; `404` if not found.

---

### GET `branches/:id`

Get a branch by ID.

**Path** — `id`: branch UUID.

**Success (200)** — `data`: branch.

**Errors** — `404` if not found.

---

### PATCH `branches/:id/head`

Update the branch’s head commit (e.g. after a new commit or merge).

**Path** — `id`: branch UUID.

**Request body**

| Field        | Type   | Required | Description     |
|--------------|--------|----------|-----------------|
| headCommitId | string | Yes      | Commit UUID or null |

**Success (200)** — `data`: updated branch.

**Errors** — `404` if branch not found.

### DELETE `branches/:id`

Delete a branch. **Path** — `id`: branch UUID. **Success (200)**. **Errors** — `404` if not found.

---

## Merge requests and diff

### POST `merge-requests/`

Create a merge request (source branch → target branch).

**Request body**

| Field          | Type   | Required | Description     |
|----------------|--------|----------|-----------------|
| repositoryId   | string | Yes      | Repository UUID |
| sourceBranchId | string | Yes      | Branch to merge from |
| targetBranchId| string | Yes      | Branch to merge into |
| title          | string | Yes      | MR title        |
| description    | string | No       | MR description  |
| createdBy      | string | Yes      | User UUID       |

**Success (201)** — `data`: merge request with `id`, `repositoryId`, `sourceBranchId`, `targetBranchId`, `title`, `description`, `status` (OPEN), `createdBy`, `mergedBy`, `mergedCommitId`, `createdAt`, `updatedAt`.

---

### GET `merge-requests/list`

List merge requests, optionally by status.

**Query**

| Param        | Type   | Required | Default | Description     |
|--------------|--------|----------|---------|-----------------|
| repositoryId | string | Yes      | —       | Repository UUID |
| status       | string | No       | —       | OPEN, MERGED, CLOSED |
| skip         | number | No       | 0       | Offset          |
| take         | number | No       | 50      | Limit (1–100)   |

**Success (200)** — `data`: array of merge requests.

---

### GET `merge-requests/diff`

Compute diff between two **branch heads**.

**Query**

| Param        | Type   | Required | Description              |
|--------------|--------|----------|--------------------------|
| repositoryId | string | Yes      | Repository UUID          |
| baseBranch   | string | Yes      | Base branch name         |
| targetBranch | string | Yes      | Target branch name       |

**Success (200)** — `data`: diff result (see [Diff result shape](#diff-result-shape)).

**Errors** — `400` if params missing; `404` if branches not found or have no head commit.

---

### GET `merge-requests/diff/commits`

Compute diff between two **commits**.

**Query**

| Param          | Type   | Required | Description   |
|----------------|--------|----------|---------------|
| baseCommitId   | string | Yes      | Base commit UUID |
| targetCommitId| string | Yes      | Target commit UUID |

**Success (200)** — `data`: diff result (see [Diff result shape](#diff-result-shape)).

**Errors** — `400` if params missing; `404` if commits not found.

---

### GET `merge-requests/:id`

Get a merge request by ID.

**Path** — `id`: merge request UUID.

**Success (200)** — `data`: merge request.

**Errors** — `404` if not found.

---

### GET `merge-requests/:id/diff`

Compute diff for this MR (target branch → source branch): what would change if the MR were merged.

**Path** — `id`: merge request UUID.

**Success (200)** — `data`: diff result (see [Diff result shape](#diff-result-shape)).

**Errors** — `404` if MR or branches not found, or branches have no head commit.

---

### PATCH `merge-requests/:id/status`

Update merge request status.

**Path** — `id`: merge request UUID.

**Request body**

| Field  | Type   | Required | Description     |
|--------|--------|----------|-----------------|
| status | string | Yes      | OPEN, MERGED, or CLOSED |

**Success (200)** — `data`: updated merge request.

**Errors** — `404` if not found.

---

### POST `merge-requests/:id/merge`

Mark the merge request as merged and record merge commit and user.

**Path** — `id`: merge request UUID.

**Request body**

| Field         | Type   | Required | Description   |
|---------------|--------|----------|---------------|
| mergedBy      | string | Yes      | User UUID     |
| mergedCommitId| string | Yes      | Resulting merge commit UUID |

**Success (200)** — `data`: updated merge request (status MERGED).

**Errors** — `400` if MR not found or not OPEN (e.g. already merged/closed).

---

### GET `merge-requests/:id/comments`

List comments on a merge request.

**Path** — `id`: merge request UUID.

**Query**

| Param | Type   | Required | Default | Description |
|-------|--------|----------|---------|-------------|
| skip  | number | No       | 0       | Offset      |
| take  | number | No       | 50      | Limit       |

**Success (200)** — `data`: array of `{ id, mergeRequestId, userId, comment, createdAt }`.

---

### POST `merge-requests/:id/comments`

Add a comment to a merge request.

**Path** — `id`: merge request UUID.

**Request body**

| Field   | Type   | Required | Description |
|---------|--------|----------|-------------|
| userId  | string | Yes      | User UUID   |
| comment | string | Yes      | Comment text (min length 1) |

**Success (201)** — `data`: created comment.

**Errors** — `404` if merge request not found.

---

### Diff result shape

All diff endpoints return the same structure:

```json
{
  "success": true,
  "data": {
    "added": [
      { "path": "new/file.json", "blobId": "uuid", "contentHash": "sha256-hex" }
    ],
    "removed": [
      { "path": "deleted.json", "blobId": "uuid", "contentHash": "sha256-hex" }
    ],
    "modified": [
      {
        "path": "changed.json",
        "base": { "blobId": "uuid", "contentHash": "sha256-hex" },
        "target": { "blobId": "uuid", "contentHash": "sha256-hex" }
      }
    ]
  }
}
```

- **added** — Paths present only in the target (new blobs).
- **removed** — Paths present only in the base (removed blobs).
- **modified** — Paths in both with different `contentHash` (changed content).
- Paths use `/` for nesting (e.g. `rules/main.json`).

---

## Execute

Execute the **index.json** decision graph from a repository branch (default `main`). The engine loads `index.json` from the branch’s root tree, resolves any Decision nodes (sub-decisions) from the same repository and branch, and evaluates with the provided context.

### POST `execute/`

Execute index.json in a repository with the given context.

**Request body**

| Field         | Type   | Required | Description                                      |
|---------------|--------|----------|--------------------------------------------------|
| repositoryId  | string | Yes      | Repository UUID                                  |
| context       | any    | Yes      | Input context for the decision (JSON object)      |
| branch        | string | No       | Branch name; default `main`                      |

**Success (200)** — `data`: `{ result, performance }`

- **result** — Output of the decision evaluation (depends on the JDM graph).
- **performance** — Engine-reported or measured execution time (e.g. `"2ms"`).

**Errors**

- `400` — Validation failed (e.g. missing `repositoryId` or `context`).
- `404` — `index.json` not found in the repository on the given branch.
- `500` — Evaluation error (e.g. invalid graph, runtime error in a node).

**Example**

```json
// Request
{
  "repositoryId": "550e8400-e29b-41d4-a716-446655440000",
  "context": {
    "customer": { "tier": "gold", "yearsActive": 3 },
    "order": { "subtotal": 250, "items": 5 }
  }
}

// Optional: use a different branch
{
  "repositoryId": "550e8400-e29b-41d4-a716-446655440000",
  "context": { "input": 42 },
  "branch": "develop"
}

// Response
{
  "success": true,
  "data": {
    "result": { "discount": 0.15, "freeShipping": true },
    "performance": "3ms"
  }
}
```

**Notes**

- `index.json` must exist at the **root** of the branch’s tree (a blob entry named `index.json`).
- Decision nodes in the graph that reference other JSON files (e.g. `pricing/discount.json`) are loaded from the same repository and branch.

---

## Status code summary

| Code | Meaning                    |
|------|----------------------------|
| 200  | OK                         |
| 201  | Created                    |
| 400  | Bad request / validation   |
| 401  | Unauthorized               |
| 404  | Not found                  |
| 409  | Conflict (e.g. duplicate)  |
| 500  | Internal server error      |
