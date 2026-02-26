import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  getRepository,
  listBranches,
  listCommits,
  createBranch,
  deleteBranch,
  getCommitDiff,
  getMergeRequestDiff,
  listMergeRequests,
  createMergeRequest,
  performMergeRequest,
  isApiError,
  type Branch,
  type Commit,
  type DiffResult,
  type MergeRequest,
} from "../services/api";
import { getUser } from "../../auth/services/auth";
import { TrashIcon } from "../components/icons/TrashIcon";
import { FileDiffViewer } from "../components/FileDiffViewer";
import { ThemePicker } from "../../../components/ThemePicker";
import "./BranchManagementPage.css";

export function BranchManagementPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getUser();
  const branchParam = searchParams.get("branch") || "main";

  const [repo, setRepo] = useState<{ id: string; name: string; defaultBranch: string; currentUserRole?: string } | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [sourceBranchId, setSourceBranchId] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [commitDiff, setCommitDiff] = useState<{ commit: Commit; diff: DiffResult } | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [loadingMRs, setLoadingMRs] = useState(false);
  const [createMRModal, setCreateMRModal] = useState(false);
  const [mrSourceBranchId, setMrSourceBranchId] = useState("");
  const [mrTargetBranchId, setMrTargetBranchId] = useState("");
  const [mrTitle, setMrTitle] = useState("");
  const [mrDescription, setMrDescription] = useState("");
  const [creatingMR, setCreatingMR] = useState(false);
  const [mergingMRId, setMergingMRId] = useState<string | null>(null);
  const [viewMR, setViewMR] = useState<{ mr: MergeRequest; diff: DiffResult } | null>(null);
  const [loadingMRDiff, setLoadingMRDiff] = useState(false);

  const currentBranch = branches.find((b) => b.name === branchParam) ?? null;
  const canMergeMR = repo?.currentUserRole === "ADMIN" || repo?.currentUserRole === "MAINTAINER";

  useEffect(() => {
    if (!repositoryId) return;
    getRepository(repositoryId).then((res) => {
      if (isApiError(res)) return;
      if (res.data)
        setRepo({
          id: res.data.id,
          name: res.data.name,
          defaultBranch: res.data.defaultBranch,
          currentUserRole: res.data.currentUserRole,
        });
    });
  }, [repositoryId]);

  const loadBranches = useCallback(() => {
    if (!repositoryId) return;
    setLoadingBranches(true);
    setError(null);
    listBranches(repositoryId)
      .then((res) => {
        if (isApiError(res)) {
          setError(res.message);
          setBranches([]);
        } else {
          setBranches(res.data ?? []);
        }
      })
      .finally(() => setLoadingBranches(false));
  }, [repositoryId]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    if (!repositoryId || !branchParam) return;
    setLoadingCommits(true);
    setError(null);
    listCommits(repositoryId, { branch: branchParam, take: 100 })
      .then((res) => {
        if (isApiError(res)) {
          setError(res.message);
          setCommits([]);
        } else {
          setCommits(res.data ?? []);
        }
      })
      .finally(() => setLoadingCommits(false));
  }, [repositoryId, branchParam]);

  useEffect(() => {
    if (createModal && branches.length > 0 && !sourceBranchId) {
      const current = branches.find((b) => b.name === branchParam);
      setSourceBranchId(current?.id ?? branches[0].id);
    }
  }, [createModal, branches, branchParam, sourceBranchId]);

  const loadMergeRequests = useCallback(() => {
    if (!repositoryId) return;
    setLoadingMRs(true);
    listMergeRequests(repositoryId, { status: "OPEN", take: 50 })
      .then((res) => {
        if (!isApiError(res) && res.data) setMergeRequests(res.data);
        else setMergeRequests([]);
      })
      .finally(() => setLoadingMRs(false));
  }, [repositoryId]);

  useEffect(() => {
    loadMergeRequests();
  }, [loadMergeRequests]);

  useEffect(() => {
    if (createMRModal && branches.length > 0) {
      const current = branches.find((b) => b.name === branchParam);
      const defaultTarget = branches.find((b) => b.name === repo?.defaultBranch) ?? branches[0];
      if (!mrSourceBranchId) setMrSourceBranchId(current?.id ?? branches[0].id);
      if (!mrTargetBranchId) setMrTargetBranchId(defaultTarget?.id ?? branches[0].id);
    }
  }, [createMRModal, branches, branchParam, repo?.defaultBranch, mrSourceBranchId, mrTargetBranchId]);

  function handleBranchSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const name = e.target.value;
    setSearchParams({ branch: name });
  }

  async function handleCreateBranch(name: string) {
    const trimmed = name?.trim();
    if (!repositoryId || !user?.id || !trimmed) return;
    const sourceBranch = branches.find((b) => b.id === sourceBranchId);
    setCreating(true);
    setError(null);
    const res = await createBranch(
      repositoryId,
      trimmed,
      user.id,
      sourceBranch?.headCommitId ?? undefined
    );
    setCreating(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setCreateModal(false);
    setNewBranchName("");
    loadBranches();
    setSearchParams({ branch: res.data!.name });
  }

  async function handleDeleteBranch(branch: Branch) {
    if (!user?.id) return;
    setDeleting(true);
    setError(null);
    const res = await deleteBranch(branch.id);
    setDeleting(false);
    setDeleteConfirm(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    loadBranches();
    if (branchParam === branch.name) {
      const remaining = branches.filter((b) => b.id !== branch.id);
      const next = remaining[0]?.name ?? repo?.defaultBranch ?? "main";
      setSearchParams({ branch: next });
    }
  }

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
    } catch {
      return iso;
    }
  }

  async function handleCreateMergeRequest() {
    if (!repositoryId || !user?.id || !mrTitle.trim()) return;
    if (mrSourceBranchId === mrTargetBranchId) {
      setError("Source and target branch must be different");
      return;
    }
    setCreatingMR(true);
    setError(null);
    const res = await createMergeRequest({
      repositoryId,
      sourceBranchId: mrSourceBranchId,
      targetBranchId: mrTargetBranchId,
      title: mrTitle.trim(),
      description: mrDescription.trim() || null,
      createdBy: user.id,
    });
    setCreatingMR(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setCreateMRModal(false);
    setMrTitle("");
    setMrDescription("");
    loadMergeRequests();
  }

  async function handleViewMR(mr: MergeRequest) {
    setLoadingMRDiff(true);
    setViewMR(null);
    setError(null);
    const res = await getMergeRequestDiff(mr.id, { includeContent: true });
    setLoadingMRDiff(false);
    if (isApiError(res) || !res.data) {
      setError(res.success === false ? (res as { message: string }).message : "Failed to load changes");
      return;
    }
    setViewMR({ mr, diff: res.data });
  }

  async function handlePerformMerge(mr: MergeRequest) {
    if (!canMergeMR) return;
    setMergingMRId(mr.id);
    setError(null);
    const res = await performMergeRequest(mr.id);
    setMergingMRId(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setViewMR(null);
    loadMergeRequests();
    loadBranches();
  }

  async function handleCommitIdClick(c: Commit) {
    setLoadingDiff(true);
    setCommitDiff(null);
    const res = await getCommitDiff(c.id, { includeContent: true });
    setLoadingDiff(false);
    if (isApiError(res) || !res.data) {
      setError(res.success === false ? (res as { message: string }).message : "Failed to load changes");
      return;
    }
    setError(null);
    setCommitDiff({ commit: c, diff: res.data });
  }

  if (!repo) {
    return (
      <div className="branch-mgmt-page">
        <div className="branch-mgmt-loading">Loading repository…</div>
      </div>
    );
  }

  return (
    <div className="branch-mgmt-page">
      <header className="branch-mgmt-header">
        <button
          type="button"
          className="branch-mgmt-back"
          onClick={() => navigate(`/dashboard/repo/${repositoryId}?branch=${encodeURIComponent(branchParam)}`)}
        >
          ← Editor
        </button>
        {canMergeMR && (
          <button
            type="button"
            className="branch-mgmt-back"
            onClick={() => navigate(`/dashboard/repo/${repositoryId}/settings`)}
          >
            Settings
          </button>
        )}
        <h1 className="branch-mgmt-title">{repo.name} <span className="branch-mgmt-repo-id">({repo.id})</span> — Branches</h1>
        <ThemePicker />
      </header>

      <div className="branch-mgmt-toolbar">
        <label className="branch-mgmt-label">
          Branch
          <select
            className="branch-mgmt-select"
            value={branchParam}
            onChange={handleBranchSelect}
            disabled={loadingBranches}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
                {b.name === repo.defaultBranch ? " (default)" : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="branch-mgmt-actions">
          <button type="button" className="branch-mgmt-btn primary" onClick={() => setCreateMRModal(true)}>
            Create merge request
          </button>
          <button type="button" className="branch-mgmt-btn primary" onClick={() => setCreateModal(true)}>
            Create branch
          </button>
          {currentBranch && (
            <button
              type="button"
              className="branch-mgmt-btn danger"
              onClick={() => setDeleteConfirm(currentBranch)}
              disabled={branches.length <= 1}
              title={branches.length <= 1 ? "Cannot delete the only branch" : "Delete this branch"}
            >
              <TrashIcon size={16} className="branch-mgmt-btn-icon" />
              Delete branch
            </button>
          )}
        </div>
      </div>

      {error && <div className="branch-mgmt-error">{error}</div>}

      <section className="branch-mgmt-mrs">
        <h2 className="branch-mgmt-section-title">Merge requests (open)</h2>
        {loadingMRs ? (
          <div className="branch-mgmt-loading-inline">Loading merge requests…</div>
        ) : mergeRequests.length === 0 ? (
          <div className="branch-mgmt-empty">No open merge requests.</div>
        ) : (
          <ul className="branch-mgmt-mr-list">
            {mergeRequests.map((mr) => {
              const sourceName = branches.find((b) => b.id === mr.sourceBranchId)?.name ?? mr.sourceBranchId.slice(0, 7);
              const targetName = branches.find((b) => b.id === mr.targetBranchId)?.name ?? mr.targetBranchId.slice(0, 7);
              return (
                <li key={mr.id} className="branch-mgmt-mr-item">
                  <button
                    type="button"
                    className="branch-mgmt-mr-title-btn"
                    onClick={() => handleViewMR(mr)}
                    disabled={loadingMRDiff}
                  >
                    {mr.title}
                  </button>
                  <span className="branch-mgmt-mr-branches">
                    {sourceName} → {targetName}
                  </span>
                  <span className="branch-mgmt-mr-date">{formatDate(mr.createdAt)}</span>
                  <div className="branch-mgmt-mr-row-actions">
                    <button
                      type="button"
                      className="branch-mgmt-btn secondary branch-mgmt-mr-view-btn"
                      disabled={loadingMRDiff}
                      onClick={() => handleViewMR(mr)}
                    >
                      View
                    </button>
                    {canMergeMR && (
                      <button
                        type="button"
                        className="branch-mgmt-btn primary branch-mgmt-mr-merge-btn"
                        disabled={mergingMRId !== null}
                        onClick={() => handlePerformMerge(mr)}
                      >
                        {mergingMRId === mr.id ? "Merging…" : "Merge"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="branch-mgmt-commits">
        <h2 className="branch-mgmt-section-title">Commits</h2>
        {loadingCommits ? (
          <div className="branch-mgmt-loading-inline">Loading commits…</div>
        ) : commits.length === 0 ? (
          <div className="branch-mgmt-empty">No commits in this branch yet.</div>
        ) : (
          <ul className="branch-mgmt-commit-list">
            {commits.map((c) => (
              <li key={c.id} className="branch-mgmt-commit-item">
                <button
                  type="button"
                  className="branch-mgmt-commit-id-btn"
                  title={`${c.id}\nClick to see changes`}
                  onClick={() => handleCommitIdClick(c)}
                  disabled={loadingDiff}
                >
                  {c.id.slice(0, 7)}
                </button>
                <span className="branch-mgmt-commit-message">{c.message || "(no message)"}</span>
                <span className="branch-mgmt-commit-author">{c.authorName ?? "—"}</span>
                <span className="branch-mgmt-commit-date">{formatDate(c.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {createMRModal && (
        <div className="branch-mgmt-modal-backdrop" onClick={() => setCreateMRModal(false)} role="presentation">
          <div className="branch-mgmt-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="branch-mgmt-modal-title">Create merge request</h2>
            <label className="branch-mgmt-modal-label">Source branch (to merge from)</label>
            <select
              className="branch-mgmt-modal-select"
              value={mrSourceBranchId}
              onChange={(e) => setMrSourceBranchId(e.target.value)}
              disabled={creatingMR}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <label className="branch-mgmt-modal-label">Target branch (to merge into)</label>
            <select
              className="branch-mgmt-modal-select"
              value={mrTargetBranchId}
              onChange={(e) => setMrTargetBranchId(e.target.value)}
              disabled={creatingMR}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <label className="branch-mgmt-modal-label">Title</label>
            <input
              type="text"
              className="branch-mgmt-modal-input"
              placeholder="e.g. Add new rules for X"
              value={mrTitle}
              onChange={(e) => setMrTitle(e.target.value)}
              disabled={creatingMR}
            />
            <label className="branch-mgmt-modal-label">Description (optional)</label>
            <textarea
              className="branch-mgmt-modal-input branch-mgmt-modal-textarea"
              placeholder="Describe the changes..."
              value={mrDescription}
              onChange={(e) => setMrDescription(e.target.value)}
              disabled={creatingMR}
              rows={3}
            />
            <div className="branch-mgmt-modal-actions">
              <button type="button" className="branch-mgmt-modal-btn secondary" onClick={() => setCreateMRModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="branch-mgmt-modal-btn primary"
                disabled={creatingMR || !mrTitle.trim() || mrSourceBranchId === mrTargetBranchId}
                onClick={handleCreateMergeRequest}
              >
                {creatingMR ? "Creating…" : "Create merge request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {createModal && (
        <div className="branch-mgmt-modal-backdrop" onClick={() => setCreateModal(false)} role="presentation">
          <div className="branch-mgmt-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="branch-mgmt-modal-title">Create new branch</h2>
            <label className="branch-mgmt-modal-label">Source branch</label>
            <select
              className="branch-mgmt-modal-select"
              value={sourceBranchId}
              onChange={(e) => setSourceBranchId(e.target.value)}
              disabled={creating}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <label className="branch-mgmt-modal-label">New branch name</label>
            <input
              type="text"
              className="branch-mgmt-modal-input"
              placeholder="e.g. feature/my-feature"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              disabled={creating}
            />
            <div className="branch-mgmt-modal-actions">
              <button type="button" className="branch-mgmt-modal-btn secondary" onClick={() => setCreateModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="branch-mgmt-modal-btn primary"
                disabled={creating || !newBranchName.trim()}
                onClick={() => handleCreateBranch(newBranchName)}
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="branch-mgmt-modal-backdrop" onClick={() => setDeleteConfirm(null)} role="presentation">
          <div className="branch-mgmt-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="branch-mgmt-modal-title">Delete branch</h2>
            <p className="branch-mgmt-modal-text">
              Are you sure you want to delete the branch <strong>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
            <div className="branch-mgmt-modal-actions">
              <button type="button" className="branch-mgmt-modal-btn secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="branch-mgmt-modal-btn danger"
                disabled={deleting}
                onClick={() => handleDeleteBranch(deleteConfirm)}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingMRDiff && (
        <div className="branch-mgmt-modal-backdrop" role="presentation">
          <div className="branch-mgmt-modal branch-mgmt-modal-loading">
            <p className="branch-mgmt-modal-text">Loading file changes…</p>
          </div>
        </div>
      )}

      {viewMR && (
        <div
          className="branch-mgmt-modal-backdrop"
          onClick={() => setViewMR(null)}
          role="presentation"
        >
          <div className="branch-mgmt-modal branch-mgmt-modal-diff" onClick={(e) => e.stopPropagation()}>
            <h2 className="branch-mgmt-modal-title">{viewMR.mr.title}</h2>
            <p className="branch-mgmt-modal-text branch-mgmt-commit-meta">
              {branches.find((b) => b.id === viewMR.mr.sourceBranchId)?.name ?? "source"} →{" "}
              {branches.find((b) => b.id === viewMR.mr.targetBranchId)?.name ?? "target"}
              {viewMR.mr.description && ` · ${viewMR.mr.description}`}
            </p>
            <div className="branch-mgmt-diff-list">
              {viewMR.diff.added.length > 0 && (
                <div className="branch-mgmt-diff-section">
                  <strong className="branch-mgmt-diff-added">Added</strong>
                  {viewMR.diff.added.map((a) =>
                    a.content !== undefined ? (
                      <FileDiffViewer
                        key={a.path}
                        path={a.path}
                        oldContent={null}
                        newContent={a.content}
                        mode="added"
                      />
                    ) : (
                      <ul key={a.path}>
                        <li>{a.path}</li>
                      </ul>
                    )
                  )}
                </div>
              )}
              {viewMR.diff.removed.length > 0 && (
                <div className="branch-mgmt-diff-section">
                  <strong className="branch-mgmt-diff-removed">Removed</strong>
                  {viewMR.diff.removed.map((r) =>
                    r.content !== undefined ? (
                      <FileDiffViewer
                        key={r.path}
                        path={r.path}
                        oldContent={r.content}
                        newContent={null}
                        mode="removed"
                      />
                    ) : (
                      <ul key={r.path}>
                        <li>{r.path}</li>
                      </ul>
                    )
                  )}
                </div>
              )}
              {viewMR.diff.modified.length > 0 && (
                <div className="branch-mgmt-diff-section">
                  <strong className="branch-mgmt-diff-modified">Modified</strong>
                  {viewMR.diff.modified.map((m) =>
                    m.base.content !== undefined && m.target.content !== undefined ? (
                      <FileDiffViewer
                        key={m.path}
                        path={m.path}
                        oldContent={m.base.content}
                        newContent={m.target.content}
                        mode="modified"
                      />
                    ) : (
                      <ul key={m.path}>
                        <li>{m.path}</li>
                      </ul>
                    )
                  )}
                </div>
              )}
              {viewMR.diff.added.length === 0 &&
                viewMR.diff.removed.length === 0 &&
                viewMR.diff.modified.length === 0 && (
                  <p className="branch-mgmt-diff-empty">No file changes.</p>
                )}
            </div>
            <div className="branch-mgmt-modal-actions">
              <button
                type="button"
                className="branch-mgmt-modal-btn secondary"
                onClick={() => setViewMR(null)}
              >
                Close
              </button>
              {canMergeMR && (
                <button
                  type="button"
                  className="branch-mgmt-modal-btn primary"
                  disabled={mergingMRId !== null}
                  onClick={() => handlePerformMerge(viewMR.mr)}
                >
                  {mergingMRId === viewMR.mr.id ? "Merging…" : "Merge"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {commitDiff && (
        <div
          className="branch-mgmt-modal-backdrop"
          onClick={() => setCommitDiff(null)}
          role="presentation"
        >
          <div className="branch-mgmt-modal branch-mgmt-modal-diff" onClick={(e) => e.stopPropagation()}>
            <h2 className="branch-mgmt-modal-title">
              Changes in commit {commitDiff.commit.id.slice(0, 7)}
            </h2>
            <p className="branch-mgmt-modal-text branch-mgmt-commit-meta">
              {commitDiff.commit.message || "(no message)"} — {commitDiff.commit.authorName ?? "—"} —{" "}
              {formatDate(commitDiff.commit.createdAt)}
            </p>
            <div className="branch-mgmt-diff-list">
              {commitDiff.diff.added.length > 0 && (
                <div className="branch-mgmt-diff-section">
                  <strong className="branch-mgmt-diff-added">Added</strong>
                  {commitDiff.diff.added.map((a) =>
                    a.content !== undefined ? (
                      <FileDiffViewer
                        key={a.path}
                        path={a.path}
                        oldContent={null}
                        newContent={a.content}
                        mode="added"
                      />
                    ) : (
                      <ul key={a.path}>
                        <li>{a.path}</li>
                      </ul>
                    )
                  )}
                </div>
              )}
              {commitDiff.diff.removed.length > 0 && (
                <div className="branch-mgmt-diff-section">
                  <strong className="branch-mgmt-diff-removed">Removed</strong>
                  {commitDiff.diff.removed.map((r) =>
                    r.content !== undefined ? (
                      <FileDiffViewer
                        key={r.path}
                        path={r.path}
                        oldContent={r.content}
                        newContent={null}
                        mode="removed"
                      />
                    ) : (
                      <ul key={r.path}>
                        <li>{r.path}</li>
                      </ul>
                    )
                  )}
                </div>
              )}
              {commitDiff.diff.modified.length > 0 && (
                <div className="branch-mgmt-diff-section">
                  <strong className="branch-mgmt-diff-modified">Modified</strong>
                  {commitDiff.diff.modified.map((m) =>
                    m.base.content !== undefined && m.target.content !== undefined ? (
                      <FileDiffViewer
                        key={m.path}
                        path={m.path}
                        oldContent={m.base.content}
                        newContent={m.target.content}
                        mode="modified"
                      />
                    ) : (
                      <ul key={m.path}>
                        <li>{m.path}</li>
                      </ul>
                    )
                  )}
                </div>
              )}
              {commitDiff.diff.added.length === 0 &&
                commitDiff.diff.removed.length === 0 &&
                commitDiff.diff.modified.length === 0 && (
                  <p className="branch-mgmt-diff-empty">No file changes.</p>
                )}
            </div>
            <div className="branch-mgmt-modal-actions">
              <button
                type="button"
                className="branch-mgmt-modal-btn secondary"
                onClick={() => setCommitDiff(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
