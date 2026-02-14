# Rule Engine Backend — Documentation

This folder contains comprehensive documentation for the **ruleenginebe** service.

## Contents

| Document | Description |
|----------|-------------|
| [**API.md**](./API.md) | Full REST API reference: endpoints, request/response shapes, status codes, and examples. |
| [**VCS.md**](./VCS.md) | Version Control System (VCS) explanation: architecture, concepts (blob, tree, commit, branch), diff, and merge requests. |

## Overview

- **Rule Engine BE** is an Express-based backend that provides:
  - **Auth** — Login / logout.
  - **Users** — User CRUD.
  - **VCS (Version Control)** — Blobs (JSON content), trees, commits, branches, merge requests, and diff between commits/branches.

All successful API responses use the shape `{ success: true, data?, message? }`. Errors use `{ success: false, message, errors? }`.

Base URL for the API is the server root (e.g. `http://localhost:3000/`). Routes are prefixed by resource: `auth/`, `users/`, `blobs/`, `trees/`, `commits/`, `branches/`, `merge-requests/`.
