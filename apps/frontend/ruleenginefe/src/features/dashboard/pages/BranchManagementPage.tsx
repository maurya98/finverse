import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  getRepository,
  listBranches,
  listCommits,
  createBranch,
  deleteBranch,
  isApiError,
  type Branch,
  type Commit,
} from "../services/api";
import { getUser } from "../../auth/services/auth";
import { TrashIcon } from "../components/icons/TrashIcon";
import "./BranchManagementPage.css";

export function BranchManagementPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getUser();
  const branchParam = searchParams.get("branch") || "main";

  const [repo, setRepo] = useState<{ id: string; name: string; defaultBranch: string } | null>(null);
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

  const currentBranch = branches.find((b) => b.name === branchParam) ?? null;

  useEffect(() => {
    if (!repositoryId) return;
    getRepository(repositoryId).then((res) => {
      if (isApiError(res)) return;
      if (res.data) setRepo({ id: res.data.id, name: res.data.name, defaultBranch: res.data.defaultBranch });
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
        <h1 className="branch-mgmt-title">{repo.name} — Branches</h1>
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
                <span className="branch-mgmt-commit-id" title={c.id}>
                  {c.id.slice(0, 7)}
                </span>
                <span className="branch-mgmt-commit-message">{c.message || "(no message)"}</span>
                <span className="branch-mgmt-commit-date">{formatDate(c.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
    </div>
  );
}
