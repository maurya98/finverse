import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../auth/services/auth";
import { logout } from "../../auth/services/authApi";
import {
  listWorkspaces,
  createWorkspace,
  deleteWorkspace,
  listRepositories,
  createRepository,
  deleteRepository,
  isApiError,
  type Workspace,
  type Repository,
} from "../services/api";
import { TrashIcon } from "../components/icons/TrashIcon";
import { ThemePicker } from "../../../components/ThemePicker";
import "./DashboardPage.css";

export function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newRepoName, setNewRepoName] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState(false);
  const [deleteWorkspaceConfirm, setDeleteWorkspaceConfirm] = useState<Workspace | null>(null);
  const [deleteRepoConfirm, setDeleteRepoConfirm] = useState<Repository | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadWorkspaces = useCallback(async () => {
    if (!user?.id) return;
    const res = await listWorkspaces(user.id);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setWorkspaces(res.data ?? []);
    if (res.data?.length && !selectedWorkspaceId) {
      setSelectedWorkspaceId(res.data[0].id);
    }
  }, [user?.id, selectedWorkspaceId]);

  const loadRepos = useCallback(async () => {
    if (!selectedWorkspaceId) {
      setRepos([]);
      return;
    }
    const res = await listRepositories(selectedWorkspaceId);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setRepos(res.data ?? []);
  }, [selectedWorkspaceId]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  useEffect(() => {
    setLoading(false);
  }, []);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !newWorkspaceName.trim()) return;
    setCreatingWorkspace(true);
    setError(null);
    const res = await createWorkspace(newWorkspaceName.trim(), user.id);
    setCreatingWorkspace(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setNewWorkspaceName("");
    loadWorkspaces();
    if (res.data) setSelectedWorkspaceId(res.data.id);
  }

  async function handleCreateRepo(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !selectedWorkspaceId || !newRepoName.trim()) return;
    setCreatingRepo(true);
    setError(null);
    const res = await createRepository(newRepoName.trim(), selectedWorkspaceId, user.id);
    setCreatingRepo(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setNewRepoName("");
    loadRepos();
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function openRepository(repo: Repository) {
    navigate(`/dashboard/repo/${repo.id}?branch=${encodeURIComponent(repo.defaultBranch)}`);
  }

  async function handleDeleteWorkspace(ws: Workspace) {
    setDeleting(true);
    setError(null);
    const res = await deleteWorkspace(ws.id);
    setDeleting(false);
    setDeleteWorkspaceConfirm(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    if (selectedWorkspaceId === ws.id) {
      const remaining = workspaces.filter((w) => w.id !== ws.id);
      setSelectedWorkspaceId(remaining[0]?.id ?? null);
    }
    loadWorkspaces();
  }

  async function handleDeleteRepository(repo: Repository) {
    setDeleting(true);
    setError(null);
    const res = await deleteRepository(repo.id);
    setDeleting(false);
    setDeleteRepoConfirm(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    loadRepos();
  }

  const selectedWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Rule Engine — Dashboard</h1>
        <div className="dashboard-user">
          <button type="button" onClick={() => navigate("/dashboard/logs")}>
            Logs
          </button>
          <ThemePicker />
          {user && <span>{user.email}</span>}
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="workspaces-section">
          <h2>Workspaces</h2>
          <form onSubmit={handleCreateWorkspace} className="create-form">
            <input
              type="text"
              placeholder="New workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              disabled={creatingWorkspace}
            />
            <button type="submit" disabled={creatingWorkspace || !newWorkspaceName.trim()}>
              {creatingWorkspace ? "Creating…" : "Create workspace"}
            </button>
          </form>
          <div className="workspace-list">
            {workspaces.map((w) => (
              <div
                key={w.id}
                className={`workspace-card ${selectedWorkspaceId === w.id ? "selected" : ""}`}
              >
                <button
                  type="button"
                  className="workspace-card-main"
                  onClick={() => setSelectedWorkspaceId(w.id)}
                >
                  <span className="workspace-name">{w.name}</span>
                </button>
                <button
                  type="button"
                  className="workspace-card-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteWorkspaceConfirm(w);
                  }}
                  title="Delete workspace and all its repositories"
                  aria-label="Delete workspace"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="repos-section">
          <h2>
            {selectedWorkspace ? `Repositories — ${selectedWorkspace.name}` : "Select a workspace"}
          </h2>
          {selectedWorkspaceId && (
            <>
              <form onSubmit={handleCreateRepo} className="create-form">
                <input
                  type="text"
                  placeholder="New repository name"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  disabled={creatingRepo}
                />
                <button type="submit" disabled={creatingRepo || !newRepoName.trim()}>
                  {creatingRepo ? "Creating…" : "Create repository"}
                </button>
              </form>
              <div className="repo-list">
                {repos.map((r) => (
                  <div key={r.id} className="repo-card">
                    <button
                      type="button"
                      className="repo-card-main"
                      onClick={() => openRepository(r)}
                    >
                      <span className="repo-name">{r.name}</span>
                      <span className="repo-meta">branch: {r.defaultBranch}</span>
                    </button>
                    <button
                      type="button"
                      className="repo-card-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteRepoConfirm(r);
                      }}
                      title="Delete repository and all branches and files"
                      aria-label="Delete repository"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {deleteWorkspaceConfirm && (
        <div className="dashboard-modal-backdrop" onClick={() => !deleting && setDeleteWorkspaceConfirm(null)} role="presentation">
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="dashboard-modal-title">Delete workspace</h3>
            <p className="dashboard-modal-text">
              Delete <strong>{deleteWorkspaceConfirm.name}</strong>? This will permanently delete this workspace and
              all its repositories, branches, folders, and files. This cannot be undone.
            </p>
            <div className="dashboard-modal-actions">
              <button type="button" className="dashboard-modal-btn secondary" onClick={() => setDeleteWorkspaceConfirm(null)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="dashboard-modal-btn danger" onClick={() => handleDeleteWorkspace(deleteWorkspaceConfirm)} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete workspace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteRepoConfirm && (
        <div className="dashboard-modal-backdrop" onClick={() => !deleting && setDeleteRepoConfirm(null)} role="presentation">
          <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="dashboard-modal-title">Delete repository</h3>
            <p className="dashboard-modal-text">
              Delete <strong>{deleteRepoConfirm.name}</strong>? This will permanently delete this repository and
              all its branches, folders, and files. This cannot be undone.
            </p>
            <div className="dashboard-modal-actions">
              <button type="button" className="dashboard-modal-btn secondary" onClick={() => setDeleteRepoConfirm(null)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="dashboard-modal-btn danger" onClick={() => handleDeleteRepository(deleteRepoConfirm)} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete repository"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      {loading && <div className="dashboard-loading">Loading…</div>}
    </div>
  );
}
