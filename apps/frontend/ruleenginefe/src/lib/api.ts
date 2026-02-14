/**
 * API client for Rule Engine Backend.
 * Base URL: VITE_API_URL or http://localhost:3000
 */

import { getToken } from "./auth";

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url && typeof url === "string") return url.replace(/\/$/, "");
  return "http://localhost:3000";
};

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type ApiSuccess<T> = {
  success: true;
  data?: T;
  message?: string;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Array<{ path?: string; message: string }>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError(r: ApiResponse<unknown>): r is ApiError {
  return r.success === false;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const base = getBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok && !isApiError(json)) {
    return { success: false, message: (json as ApiSuccess<unknown>)?.message ?? "Request failed" };
  }
  return json;
}

// --- Auth ---
export type LoginBody = { email: string; password: string };
export type LoginData = {
  token: string;
  user: { id: string; email: string; name: string | null; role: string };
};
export async function login(body: LoginBody): Promise<ApiResponse<LoginData>> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiResponse<LoginData>;
  if (!res.ok && !isApiError(json)) return { success: false, message: "Login failed" };
  return json;
}

// --- Workspaces ---
export type Workspace = { id: string; name: string; ownerId: string; createdAt: string };
export async function listWorkspaces(ownerId: string, skip = 0, take = 50): Promise<ApiResponse<Workspace[]>> {
  return request(`/workspaces/list?ownerId=${encodeURIComponent(ownerId)}&skip=${skip}&take=${take}`);
}
export async function createWorkspace(name: string, ownerId: string): Promise<ApiResponse<Workspace>> {
  return request("/workspaces/", { method: "POST", body: JSON.stringify({ name, ownerId }) });
}
export async function getWorkspace(id: string): Promise<ApiResponse<Workspace>> {
  return request(`/workspaces/${id}`);
}

// --- Repositories ---
export type Repository = {
  id: string;
  name: string;
  workspaceId: string;
  isPrivate: boolean;
  defaultBranch: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
export async function listRepositories(workspaceId: string, skip = 0, take = 50): Promise<ApiResponse<Repository[]>> {
  return request(`/repositories/list?workspaceId=${encodeURIComponent(workspaceId)}&skip=${skip}&take=${take}`);
}
export async function createRepository(
  name: string,
  workspaceId: string,
  createdBy: string,
  defaultBranch = "main"
): Promise<ApiResponse<Repository>> {
  return request("/repositories/", {
    method: "POST",
    body: JSON.stringify({ name, workspaceId, createdBy, defaultBranch }),
  });
}
export async function getRepository(id: string): Promise<ApiResponse<Repository>> {
  return request(`/repositories/${id}`);
}

// --- Blobs ---
export type Blob = { id: string; repositoryId: string; contentHash: string; content: unknown; createdAt: string };
export async function createBlob(repositoryId: string, content: unknown): Promise<ApiResponse<Blob>> {
  return request("/blobs/", { method: "POST", body: JSON.stringify({ repositoryId, content }) });
}
export async function getBlob(id: string): Promise<ApiResponse<Blob>> {
  return request(`/blobs/${id}`);
}
export async function listBlobs(repositoryId: string, skip = 0, take = 50): Promise<ApiResponse<Blob[]>> {
  return request(`/blobs/list?repositoryId=${encodeURIComponent(repositoryId)}&skip=${skip}&take=${take}`);
}

// --- Trees ---
export type TreeEntry = {
  id: string;
  name: string;
  type: "BLOB" | "TREE";
  blobId: string | null;
  childTreeId: string | null;
};
export type Tree = { id: string; repositoryId: string; createdAt: string; entries: TreeEntry[] };
export async function createTree(
  repositoryId: string,
  entries: Array<{ name: string; type: "BLOB" | "TREE"; blobId?: string; childTreeId?: string }> = []
): Promise<ApiResponse<Tree>> {
  return request("/trees/", { method: "POST", body: JSON.stringify({ repositoryId, entries }) });
}
export async function getTree(id: string): Promise<ApiResponse<Tree>> {
  return request(`/trees/${id}`);
}
export async function addTreeEntry(
  treeId: string,
  entry: { name: string; type: "BLOB" | "TREE"; blobId?: string; childTreeId?: string }
): Promise<ApiResponse<Tree>> {
  return request(`/trees/${treeId}/entries`, { method: "POST", body: JSON.stringify(entry) });
}
export async function removeTreeEntry(treeId: string, entryId: string): Promise<ApiResponse<Tree>> {
  return request(`/trees/${treeId}/entries/${entryId}`, { method: "DELETE" });
}
export async function updateTreeEntry(
  treeId: string,
  entryId: string,
  data: { name?: string; blobId?: string | null; childTreeId?: string | null }
): Promise<ApiResponse<Tree>> {
  return request(`/trees/${treeId}/entries/${entryId}`, { method: "PATCH", body: JSON.stringify(data) });
}

// --- Commits ---
export type Commit = {
  id: string;
  repositoryId: string;
  treeId: string;
  parentCommitId: string | null;
  mergeParentCommitId: string | null;
  message: string | null;
  authorId: string;
  createdAt: string;
};
export async function createCommit(params: {
  repositoryId: string;
  treeId: string;
  authorId: string;
  message?: string | null;
  parentCommitId?: string | null;
  mergeParentCommitId?: string | null;
}): Promise<ApiResponse<Commit>> {
  return request("/commits/", { method: "POST", body: JSON.stringify(params) });
}
export async function getCommit(id: string): Promise<ApiResponse<Commit>> {
  return request(`/commits/${id}`);
}
export async function listCommits(
  repositoryId: string,
  opts?: { branch?: string; skip?: number; take?: number }
): Promise<ApiResponse<Commit[]>> {
  const q = new URLSearchParams({ repositoryId });
  if (opts?.branch) q.set("branch", opts.branch);
  if (opts?.skip != null) q.set("skip", String(opts.skip));
  if (opts?.take != null) q.set("take", String(opts.take));
  return request(`/commits/list?${q}`);
}

// --- Branches ---
export type Branch = {
  id: string;
  repositoryId: string;
  name: string;
  headCommitId: string | null;
  createdBy: string;
  createdAt: string;
};
export async function listBranches(repositoryId: string, skip = 0, take = 50): Promise<ApiResponse<Branch[]>> {
  return request(`/branches/list?repositoryId=${encodeURIComponent(repositoryId)}&skip=${skip}&take=${take}`);
}
export async function getBranchByName(repositoryId: string, name: string): Promise<ApiResponse<Branch>> {
  return request(`/branches/by-name?repositoryId=${encodeURIComponent(repositoryId)}&name=${encodeURIComponent(name)}`);
}
export async function getBranch(id: string): Promise<ApiResponse<Branch>> {
  return request(`/branches/${id}`);
}
export async function createBranch(
  repositoryId: string,
  name: string,
  createdBy: string,
  headCommitId?: string | null
): Promise<ApiResponse<Branch>> {
  return request("/branches/", {
    method: "POST",
    body: JSON.stringify({ repositoryId, name, createdBy, headCommitId }),
  });
}
export async function updateBranchHead(id: string, headCommitId: string | null): Promise<ApiResponse<Branch>> {
  return request(`/branches/${id}/head`, { method: "PATCH", body: JSON.stringify({ headCommitId }) });
}
export async function deleteBranch(id: string): Promise<ApiResponse<unknown>> {
  return request(`/branches/${id}`, { method: "DELETE" });
}

// --- Merge requests ---
export type MergeRequest = {
  id: string;
  repositoryId: string;
  sourceBranchId: string;
  targetBranchId: string;
  title: string;
  description: string | null;
  status: string;
  createdBy: string;
  mergedBy: string | null;
  mergedCommitId: string | null;
  createdAt: string;
  updatedAt: string;
};
export type DiffResult = {
  added: Array<{ path: string; blobId: string; contentHash: string }>;
  removed: Array<{ path: string; blobId: string; contentHash: string }>;
  modified: Array<{ path: string; base: { blobId: string; contentHash: string }; target: { blobId: string; contentHash: string } }>;
};
export async function listMergeRequests(
  repositoryId: string,
  opts?: { status?: string; skip?: number; take?: number }
): Promise<ApiResponse<MergeRequest[]>> {
  const q = new URLSearchParams({ repositoryId });
  if (opts?.status) q.set("status", opts.status);
  if (opts?.skip != null) q.set("skip", String(opts.skip));
  if (opts?.take != null) q.set("take", String(opts.take));
  return request(`/merge-requests/list?${q}`);
}
export async function getMergeRequest(id: string): Promise<ApiResponse<MergeRequest>> {
  return request(`/merge-requests/${id}`);
}
export async function getMergeRequestDiff(id: string): Promise<ApiResponse<DiffResult>> {
  return request(`/merge-requests/${id}/diff`);
}
export async function createMergeRequest(params: {
  repositoryId: string;
  sourceBranchId: string;
  targetBranchId: string;
  title: string;
  description?: string | null;
  createdBy: string;
}): Promise<ApiResponse<MergeRequest>> {
  return request("/merge-requests/", { method: "POST", body: JSON.stringify(params) });
}
export async function mergeMergeRequest(id: string, mergedBy: string, mergedCommitId: string): Promise<ApiResponse<MergeRequest>> {
  return request(`/merge-requests/${id}/merge`, { method: "POST", body: JSON.stringify({ mergedBy, mergedCommitId }) });
}
export async function diffBranches(
  repositoryId: string,
  baseBranch: string,
  targetBranch: string
): Promise<ApiResponse<DiffResult>> {
  return request(
    `/merge-requests/diff?repositoryId=${encodeURIComponent(repositoryId)}&baseBranch=${encodeURIComponent(baseBranch)}&targetBranch=${encodeURIComponent(targetBranch)}`
  );
}
