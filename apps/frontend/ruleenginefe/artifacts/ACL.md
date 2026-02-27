# Access Control (ACL) — Frontend

This document describes how the Rule Engine frontend uses backend ACL: where roles are fetched, how the UI shows or hides actions based on role, and how access errors are handled.

---

## 1. Overview

- The backend enforces all access control. The frontend uses the **repository member role** (and workspace ownership) to show or hide actions and links so users don’t see options they can’t use.
- **No global user role for repo actions:** Merge permission and “Settings” / “Members” are driven by **repository role** (`currentUserRole` or `getMyRepositoryRole`), not by the global `user.role` from login.

---

## 2. How the frontend gets role

### 2.1 From repository response (`currentUserRole`)

When the backend returns a repository (e.g. `GET /repositories/:id`), the response can include **`currentUserRole`** if the authenticated user is a repository member. Values: `"ADMIN"` | `"MAINTAINER"` | `"CONTRIBUTOR"` | `"VIEWER"`.

**Used in:**

- **Repository editor** (`RepositoryEditorPage.tsx`) — Fetches repo with `getRepository(repositoryId)` and stores `repo.currentUserRole`. Used to show or hide the **Settings** link in the footer.
- **Branch management** (`BranchManagementPage.tsx`) — Same: fetches repo and stores `currentUserRole`. Used to show/hide the **Settings** link in the header and the **Merge** button on merge requests.

### 2.2 From members/me (`getMyRepositoryRole`)

`GET /repositories/:repositoryId/members/me` returns `{ role }` (or 404 if not a member).

**Used in:**

- **Repository Settings (Members) page** (`RepositorySettingsPage.tsx`) — Calls `getMyRepositoryRole(repositoryId)` to know the current user’s role. If not a member (404), shows “You are not a member of this repository or you do not have access.” If member but not ADMIN/MAINTAINER, shows the member list in read-only form and explains “Only admins and maintainers can manage members.”

---

## 3. UI behavior by role

### 3.1 Repository editor (`/dashboard/repo/:repositoryId`)

- **Settings link (footer):** Shown only when `repo.currentUserRole === "ADMIN"` or `repo.currentUserRole === "MAINTAINER"`. Links to `/dashboard/repo/:repositoryId/settings`.
- All other actions (edit files, commit, Branches link) are available to any member; the backend returns 403 if the role is insufficient for an action.

### 3.2 Branch management (`/dashboard/repo/:repositoryId/branches`)

- **Settings link (header):** Shown only when `canMergeMR` is true, i.e. `repo.currentUserRole === "ADMIN"` or `repo.currentUserRole === "MAINTAINER"`.
- **Merge button (merge requests):** Shown only when `canMergeMR` is true (same condition). Hiding the button avoids unnecessary 403s when the user tries to merge.

### 3.3 Repository Settings / Members page (`/dashboard/repo/:repositoryId/settings`)

- **Access:** If `getMyRepositoryRole` returns 404 or the user is not a member, the page shows a message that they don’t have access.
- **Can manage members:** `canManage = myRole === "ADMIN" || myRole === "MAINTAINER"`.
  - If `canManage`: show **Add member** button, role dropdowns per member, and **Remove** (with “last admin” guarded on backend and disabled in UI when applicable).
  - If not `canManage`: show member list and role as read-only; no add/remove/change role.
- **Add member:** Modal uses `listUsers()` to populate a user picker; user selects a user and role and submits `addRepositoryMember(repositoryId, userId, role)`.

---

## 4. API client (dashboard services)

In `src/features/dashboard/services/api.ts`:

- **Types:** `RepositoryMemberRole`, `RepositoryMember`, `User`; `Repository` includes optional `currentUserRole`.
- **Repository members:** `listRepositoryMembers`, `getMyRepositoryRole`, `addRepositoryMember`, `updateRepositoryMemberRole`, `removeRepositoryMember`.
- **Users (for member picker):** `listUsers()`.
- All requests that need auth send `Authorization: Bearer <token>` via `getToken()` from `src/features/auth/services/auth.ts`.

---

## 5. Handling 403 / no access

- **Opening a repository:** If the user opens a repo they are not a member of, `getRepository` (or subsequent VCS calls) can return 403. The UI may show the backend error message; a future improvement is to redirect to dashboard with a “No access” message.
- **Repository Settings page:** If the user is not a member, `getMyRepositoryRole` returns 404 and the page shows the “not a member / no access” message.
- **Merge:** Button is hidden when the user doesn’t have MAINTAINER/ADMIN, so 403 on merge should be rare; if it happens (e.g. role changed), the error is shown like other API errors.

---

## 6. Workspace and dashboard

- **Workspace list:** The backend returns only workspaces owned by the authenticated user. The frontend still calls `listWorkspaces(ownerId)` with the current user’s id; the backend ignores the param and uses the token.
- **Repository list:** Listed by `workspaceId`; the backend ensures the user is the workspace owner. No per-repo role is needed to list repos in a workspace the user owns.

---

## 7. Files reference

| Concern              | Path |
|----------------------|------|
| API client (roles, members, users) | `src/features/dashboard/services/api.ts` |
| Repository editor (Settings link) | `src/features/dashboard/pages/RepositoryEditorPage.tsx` |
| Branch management (Settings, Merge) | `src/features/dashboard/pages/BranchManagementPage.tsx` |
| Repository Settings / Members page | `src/features/dashboard/pages/RepositorySettingsPage.tsx` |
| Auth (token, user)   | `src/features/auth/services/auth.ts` |

Backend ACL behavior and API details are documented in the backend artifact: [apps/backend/ruleenginebe/artifact/ACL.md](../../backend/ruleenginebe/artifact/ACL.md) and [API.md](../../backend/ruleenginebe/artifact/API.md).
