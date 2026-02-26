import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser,
  getTokenRole,
  revalidateToken,
  clearAuth,
  canPerformPrivilegedActions,
} from "../../auth/services/auth";
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
import { Can } from "../components/Can";
import { AppButton, AppCard, AppInput, AppModal, AppIconButton, EmptyState } from "../../../components/ui";
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

export function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();
  const tokenRole = getTokenRole();
  const canPrivileged = canPerformPrivilegedActions(tokenRole);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newRepoName, setNewRepoName] = useState("");
  const [repoFilter, setRepoFilter] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [creatingRepo, setCreatingRepo] = useState(false);
  const [deleteWorkspaceConfirm, setDeleteWorkspaceConfirm] = useState<Workspace | null>(null);
  const [deleteRepoConfirm, setDeleteRepoConfirm] = useState<Repository | null>(null);
  const [deleting, setDeleting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts([
    { key: "/", handler: () => searchInputRef.current?.focus() },
    { key: "d", ctrlKey: true, shiftKey: true, handler: () => navigate("/dashboard") },
    { key: "l", ctrlKey: true, shiftKey: true, handler: () => navigate("/dashboard/logs") },
  ]);

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
      setRepos([]);
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

  const filteredRepos = useMemo(() => {
    if (!repoFilter.trim()) return repos;
    const q = repoFilter.trim().toLowerCase();
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.defaultBranch.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [repos, repoFilter]);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    const revalidated = revalidateToken();
    if (!revalidated.valid) {
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }
    if (!revalidated.userId || !newWorkspaceName.trim()) return;
    setCreatingWorkspace(true);
    setError(null);
    const res = await createWorkspace(newWorkspaceName.trim(), revalidated.userId);
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
    const revalidated = revalidateToken();
    if (!revalidated.valid) {
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }
    if (!revalidated.userId || !selectedWorkspaceId || !newRepoName.trim()) return;
    setCreatingRepo(true);
    setError(null);
    const res = await createRepository(newRepoName.trim(), selectedWorkspaceId, revalidated.userId);
    setCreatingRepo(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setNewRepoName("");
    loadRepos();
  }

  function openRepository(repo: Repository) {
    navigate(`/dashboard/repo/${repo.id}?branch=${encodeURIComponent(repo.defaultBranch)}`);
  }

  async function handleDeleteWorkspace(ws: Workspace) {
    const revalidated = revalidateToken();
    if (!revalidated.valid) {
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }
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
    const revalidated = revalidateToken();
    if (!revalidated.valid) {
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }
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
  const canDeleteWorkspace = (w: Workspace) =>
    w.ownerId === user?.id && canPrivileged;
  const canCreateRepoInSelectedWorkspace =
    selectedWorkspace && selectedWorkspace.ownerId === user?.id && canPrivileged;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "320px 1fr" }, gap: 2, p: 2, flex: 1, width: "100%", boxSizing: "border-box" }}>
        <section>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Workspaces
          </Typography>
          {canPrivileged && (
            <Box component="form" onSubmit={handleCreateWorkspace} sx={{ display: "flex", gap: 1, mb: 1 }}>
              <AppInput
                placeholder="New workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                disabled={creatingWorkspace}
                size="small"
              />
              <AppButton type="submit" variant="primary" disabled={creatingWorkspace || !newWorkspaceName.trim()}>
                {creatingWorkspace ? "Creating…" : "Create"}
              </AppButton>
            </Box>
          )}
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={48} />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {workspaces.length === 0 ? (
                <EmptyState message="No workspaces yet. Create one above." />
              ) : (
                workspaces.map((w) => (
                  <AppCard
                    key={w.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 0,
                      borderColor: selectedWorkspaceId === w.id ? "primary.main" : "divider",
                      bgcolor: selectedWorkspaceId === w.id ? "action.selected" : undefined,
                    }}
                  >
                    <Box
                      component="button"
                      onClick={() => setSelectedWorkspaceId(w.id)}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        font: "inherit",
                        color: "inherit",
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {w.name}
                      </Typography>
                    </Box>
                    {canDeleteWorkspace(w) && (
                      <AppIconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteWorkspaceConfirm(w);
                        }}
                        title="Delete workspace"
                        aria-label="Delete workspace"
                        sx={{ color: "error.main" }}
                      >
                        <TrashIcon size={18} />
                      </AppIconButton>
                    )}
                  </AppCard>
                ))
              )}
            </Box>
          )}
        </section>

        <section>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {selectedWorkspace ? `Repositories — ${selectedWorkspace.name}` : "Select a workspace"}
          </Typography>
          {selectedWorkspaceId && (
            <>
              {canCreateRepoInSelectedWorkspace && (
                <Box component="form" onSubmit={handleCreateRepo} sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "nowrap", alignItems: "center" }}>
                  <AppInput
                    placeholder="New repository name"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    disabled={creatingRepo}
                    size="small"
                    sx={{ minWidth: 0, flex: "1 1 auto" }}
                  />
                  <AppButton type="submit" variant="primary" disabled={creatingRepo || !newRepoName.trim()} sx={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                    {creatingRepo ? "Creating…" : "Create repository"}
                  </AppButton>
                </Box>
              )}
              <AppInput
                placeholder="Search repositories…"
                value={repoFilter}
                onChange={(e) => setRepoFilter(e.target.value)}
                size="small"
                inputRef={searchInputRef}
                sx={{ mb: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              {loading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="rounded" height={72} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {filteredRepos.length === 0 ? (
                    <EmptyState
                      message={repos.length === 0 ? "No repositories yet. Create one above." : "No repositories match your search."}
                    />
                  ) : (
                    filteredRepos.map((r) => (
                      <AppCard
                        key={r.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 0,
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Box
                          component="button"
                          onClick={() => openRepository(r)}
                          sx={{
                            flex: 1,
                            p: 1.5,
                            textAlign: "left",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            font: "inherit",
                            color: "inherit",
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {r.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            branch: {r.defaultBranch}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                            id: {r.id}
                          </Typography>
                        </Box>
                        <Can oneOf={["ADMIN", "MAINTAINER"]} role={r.currentUserRole}>
                          <AppButton
                            variant="ghost"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/repo/${r.id}/settings`);
                            }}
                          >
                            Settings
                          </AppButton>
                        </Can>
                        <Can oneOf={["ADMIN"]} role={r.currentUserRole}>
                          <AppIconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteRepoConfirm(r);
                            }}
                            title="Delete repository (ADMIN only)"
                            aria-label="Delete repository"
                            sx={{ color: "error.main" }}
                          >
                            <TrashIcon size={18} />
                          </AppIconButton>
                        </Can>
                      </AppCard>
                    ))
                  )}
                </Box>
              )}
            </>
          )}
        </section>
      </Box>

      <AppModal
        open={Boolean(deleteWorkspaceConfirm)}
        onClose={() => !deleting && setDeleteWorkspaceConfirm(null)}
        title="Delete workspace"
        submitLabel={deleting ? "Deleting…" : "Delete workspace"}
        cancelLabel="Cancel"
        submitDisabled={deleting}
        onSubmit={deleteWorkspaceConfirm ? () => handleDeleteWorkspace(deleteWorkspaceConfirm) : undefined}
      >
        {deleteWorkspaceConfirm && (
          <Typography variant="body2" color="text.secondary">
            Delete <strong>{deleteWorkspaceConfirm.name}</strong>? This will permanently delete this workspace and
            all its repositories, branches, folders, and files. This cannot be undone.
          </Typography>
        )}
      </AppModal>

      <AppModal
        open={Boolean(deleteRepoConfirm)}
        onClose={() => !deleting && setDeleteRepoConfirm(null)}
        title="Delete repository"
        submitLabel={deleting ? "Deleting…" : "Delete repository"}
        cancelLabel="Cancel"
        submitDisabled={deleting}
        onSubmit={deleteRepoConfirm ? () => handleDeleteRepository(deleteRepoConfirm) : undefined}
      >
        {deleteRepoConfirm && (
          <Typography variant="body2" color="text.secondary">
            Delete <strong>{deleteRepoConfirm.name}</strong>? This will permanently delete this repository and
            all its branches, folders, and files. This cannot be undone.
          </Typography>
        )}
      </AppModal>

      {error && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "error.main",
            color: "error.contrastText",
            px: 2,
            py: 1.5,
            borderRadius: 1,
            zIndex: 1300,
          }}
          role="alert"
        >
          {error}
        </Box>
      )}
    </Box>
  );
}
