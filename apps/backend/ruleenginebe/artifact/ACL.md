# Access Control (ACL) — Backend

This document describes how access control works in the Rule Engine Backend: authentication, repository roles, who can perform which actions, and the request flow through middleware.

---

## 1. Overview

- **Authentication:** All endpoints except `POST auth/login` and `POST auth/logout` require a valid JWT in the `Authorization: Bearer <token>` header. Unauthenticated requests receive `401`.
- **Workspace-level:** Access is **owner-based**. Only the workspace owner can list, get, or delete a workspace; only the owner can create repositories in it.
- **Repository-level:** Access is **role-based** via `RepositoryMember`. Each repository has a list of members with one of four roles. All VCS and repository operations require the user to be a repository member with at least the required role.
- **Branch-level:** There is no separate branch ACL. Access to branches is inherited from the repository; branch operations use the same repository role checks.

---

## 2. Roles

### 2.1 Global user role (`User.role`)

Stored on the `User` model (enum `UserRole`): `ADMIN`, `MAINTAINER`, `DEVELOPER`, `VIEWER`.  
Used for **login payload and token** only. Merge permission and repository access are **not** based on this; they use **repository member role** below.

### 2.2 Repository member role (`RepositoryMember.role`)

Stored per user per repository (enum `RepositoryMemberRole`): `ADMIN`, `MAINTAINER`, `CONTRIBUTOR`, `VIEWER`.

**Role hierarchy (lowest to highest):**

| Role         | Order | Typical use |
|--------------|-------|-------------|
| VIEWER       | 0     | Read-only: list/get blobs, trees, commits, branches, MRs; execute/simulate with repo |
| CONTRIBUTOR  | 1     | Read + write: create/update blobs, trees, commits, branches, MRs; add MR comments |
| MAINTAINER   | 2     | CONTRIBUTOR + merge MRs, manage repository members (add/remove/change role) |
| ADMIN        | 3     | MAINTAINER + delete repository; cannot demote last ADMIN or remove last ADMIN |

**Who can assign repository access:** Only a user with **ADMIN** or **MAINTAINER** on that repository can add, update, or remove repository members. The repository **creator** is auto-added as **ADMIN** when the repository is created. At least one **ADMIN** must always remain (cannot demote or remove the last admin).

---

## 3. Request flow

### 3.1 Authentication

1. **`requireAuth`** (see `src/api/middlewares/auth.middleware.ts`):
   - Reads `Authorization: Bearer <token>`.
   - Verifies JWT and sets `req.user = { id: sub, role }` (global user role from token).
   - Returns `401` if missing or invalid.

### 3.2 Repository-scoped routes

For routes that operate on a **repository** (by id, or by a resource that belongs to a repo):

1. **Resolve `repositoryId`:**
   - **From path/body/query:** Many routes have `repositoryId` in `req.params.repositoryId`, `req.params.id`, `req.body.repositoryId`, or `req.query.repositoryId`.
   - **From related resource:** When the route uses a resource id (e.g. branch id, blob id, merge request id), a middleware first loads that resource and sets `req.repositoryIdForAccess = <repositoryId>`. Middlewares: `setRepositoryIdFromBranchId`, `setRepositoryIdFromTreeId`, `setRepositoryIdFromCommitId`, `setRepositoryIdFromBlobId`, `setRepositoryIdFromMergeRequestId` (see `src/api/middlewares/repo-access.middleware.ts`).

2. **`requireRepoAccess(minRole)`:**
   - Runs after `requireAuth`.
   - Reads `repositoryId` from `req.repositoryIdForAccess`, then `params.repositoryId`, `params.id`, `body.repositoryId`, or `query.repositoryId`.
   - Looks up `RepositoryMember` for `req.user.id` and that `repositoryId`.
   - If not a member → `403` "You do not have access to this repository".
   - If member role is below `minRole` (using role order VIEWER < CONTRIBUTOR < MAINTAINER < ADMIN) → `403` "This action requires repository role X or higher".
   - On success, sets `req.repoRole = member.role` and calls `next()`.

### 3.3 Merge requests (perform-merge / merge)

Merge routes use the **merge request id** in the path, not `repositoryId`. The controller uses **`getRepoAccessFromMergeRequestId(mrId, userId, "MAINTAINER")`** to:

- Load the merge request and get its `repositoryId`.
- Check that the user is a repository member with at least **MAINTAINER**.
- Return `null` (then controller sends `403`) if not found or insufficient role; otherwise the handler proceeds to perform the merge.

### 3.4 Workspace and repository list/get/delete

- **Workspace list:** Returns only workspaces where `ownerId === req.user.id`. No `WorkspaceMember` model; list is owner-scoped.
- **Workspace get/delete:** Load workspace; if `workspace.ownerId !== req.user.id` → `403`.
- **Repository create:** Caller must be the **workspace owner** (load workspace, check `ownerId`). Creator is set to `req.user.id` and auto-added as repository **ADMIN**.
- **Repository list:** Caller must have access to the workspace (workspace owner). Repositories are listed by `workspaceId`.
- **Repository get:** `requireRepoAccess("VIEWER")` (using `params.id` as repo id). Response may include `currentUserRole` when the user is a member.
- **Repository delete:** `requireRepoAccess("ADMIN")`.

---

## 4. Where each role is enforced (summary)

| Resource / action              | Min role / check        |
|--------------------------------|-------------------------|
| Workspace create/list/get/del  | Owner only              |
| Repository create              | Workspace owner         |
| Repository get                 | VIEWER                  |
| Repository delete              | ADMIN                   |
| Repository members list/get me| VIEWER (list), any auth (me) |
| Repository members add/update/remove | MAINTAINER or ADMIN |
| Blobs/trees/commits/branches   | VIEWER read; CONTRIBUTOR write |
| Merge requests (create, list, diff, comments) | VIEWER / CONTRIBUTOR as per action |
| Merge (perform-merge, merge)   | MAINTAINER (or ADMIN)   |
| Execute / Simulate with repo   | VIEWER when `repositoryId` present |

---

## 5. Data model (relevant parts)

- **User** — `id`, `role` (UserRole), etc.
- **Workspace** — `id`, `ownerId` (User).
- **Repository** — `id`, `workspaceId`, `createdBy` (User).
- **RepositoryMember** — `repositoryId`, `userId`, `role` (RepositoryMemberRole). Unique on `(repositoryId, userId)`.

Repository creator is added as `RepositoryMember` with role `ADMIN` in `RepositoryService.create()` (inside a transaction with repo and default branch creation).

---

## 6. Files reference

| Concern              | Path |
|----------------------|------|
| Auth middleware      | `src/api/middlewares/auth.middleware.ts` |
| Repo access middleware | `src/api/middlewares/repo-access.middleware.ts` |
| Repository members   | `src/modules/repository-members/repository-members.service.ts` |
| Repository members API | `src/api/controllers/repository-members.controller.ts` |
| Schema (roles, models) | `src/databases/models/schema.prisma` |

API details (endpoints, request/response shapes) are in [API.md](./API.md), including the "Access control" section and "Repository members" endpoints.
