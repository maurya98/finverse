import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
import { SideBySideDiffViewer } from "../components/SideBySideDiffViewer";
import { JdmDiffViewer, canShowJdmDiff } from "../components/JdmDiffViewer";
import { useRepoRole } from "../contexts/RepoRoleContext";
import { AppButton } from "../../../components/ui/AppButton";
import { AppModal } from "../../../components/ui/AppModal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import "./BranchManagementPage.css";

export function BranchManagementPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [selectedDiffFilePath, setSelectedDiffFilePath] = useState<string | null>(null);
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
  const [selectedMRFilePath, setSelectedMRFilePath] = useState<string | null>(null);

  const currentBranch = branches.find((b) => b.name === branchParam) ?? null;
  const { currentUserRole } = useRepoRole();
  const canMergeMR = currentUserRole === "ADMIN" || currentUserRole === "MAINTAINER";

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
    const diff = res.data;
    setViewMR({ mr, diff });
    const added = diff.added.map((a) => a.path);
    const removed = diff.removed.map((r) => r.path);
    const modified = diff.modified.map((m) => m.path);
    const firstPath = added[0] ?? removed[0] ?? modified[0] ?? null;
    setSelectedMRFilePath(firstPath);
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
    setSelectedDiffFilePath(null);
    const res = await getCommitDiff(c.id, { includeContent: true });
    setLoadingDiff(false);
    if (isApiError(res) || !res.data) {
      setError(res.success === false ? (res as { message: string }).message : "Failed to load changes");
      return;
    }
    setError(null);
    const diff = res.data;
    setCommitDiff({ commit: c, diff });

    const firstPath =
      diff.added[0]?.path ?? diff.removed[0]?.path ?? diff.modified[0]?.path ?? null;
    setSelectedDiffFilePath(firstPath);
  }

  if (!repo) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", minHeight: 200, p: 2 }}>
        <Typography color="text.secondary">Loading repository…</Typography>
      </Box>
    );
  }

  return (
    <Box className="branch-mgmt-page" sx={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
      <Box className="branch-mgmt-body" sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden", width: "100%", boxSizing: "border-box" }}>
        <aside className="branch-mgmt-sidebar">
          <div className="branch-mgmt-sidebar-header">Branches</div>
          <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
            <InputLabel id="branch-select-label">Branch</InputLabel>
            <Select
              labelId="branch-select-label"
              label="Branch"
              value={branchParam}
              onChange={(e) => setSearchParams({ branch: e.target.value })}
              disabled={loadingBranches}
            >
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.name}>
                  {b.name}
                  {b.name === repo.defaultBranch ? " (default)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="branch-mgmt-sidebar-actions">
            <AppButton size="small" variant="primary" fullWidth onClick={() => setCreateMRModal(true)}>
              Create merge request
            </AppButton>
            <AppButton size="small" variant="primary" fullWidth onClick={() => setCreateModal(true)}>
              Create branch
            </AppButton>
            {currentBranch && (
              <AppButton
                size="small"
                variant="danger"
                fullWidth
                startIcon={<TrashIcon size={16} />}
                onClick={() => setDeleteConfirm(currentBranch)}
                disabled={branches.length <= 1}
                title={branches.length <= 1 ? "Cannot delete the only branch" : "Delete this branch"}
              >
                Delete branch
              </AppButton>
            )}
          </div>
          <div className="branch-mgmt-sidebar-mr">
            <div className="branch-mgmt-sidebar-header">Merge requests (open)</div>
            {loadingMRs ? (
              <Box sx={{ py: 1 }}>
                {[1, 2].map((i) => (
                  <Skeleton key={i} variant="rounded" height={36} sx={{ mb: 0.5 }} />
                ))}
              </Box>
            ) : mergeRequests.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", py: 1 }}>
                No open merge requests.
              </Typography>
            ) : (
              <ul className="branch-mgmt-sidebar-mr-list">
                {mergeRequests.map((mr) => {
                  const sourceName = branches.find((b) => b.id === mr.sourceBranchId)?.name ?? mr.sourceBranchId.slice(0, 7);
                  const targetName = branches.find((b) => b.id === mr.targetBranchId)?.name ?? mr.targetBranchId.slice(0, 7);
                  return (
                    <li key={mr.id} className="branch-mgmt-sidebar-mr-item">
                      <button
                        type="button"
                        className="branch-mgmt-sidebar-mr-title"
                        onClick={() => handleViewMR(mr)}
                        disabled={loadingMRDiff}
                      >
                        {mr.title}
                      </button>
                      <span className="branch-mgmt-sidebar-mr-meta">{sourceName} → {targetName}</span>
                      <div className="branch-mgmt-sidebar-mr-actions">
                        <AppButton size="small" variant="secondary" disabled={loadingMRDiff} onClick={() => handleViewMR(mr)}>
                          View
                        </AppButton>
                        {canMergeMR && (
                          <AppButton
                            size="small"
                            variant="primary"
                            disabled={mergingMRId !== null}
                            onClick={(e) => { e.stopPropagation(); handlePerformMerge(mr); }}
                          >
                            {mergingMRId === mr.id ? "Merging…" : "Merge"}
                          </AppButton>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden", p: 2, width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ flexShrink: 0 }}>
          {error}
        </Alert>
      )}

      <Box component="section" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
          Commits
        </Typography>
        <Box sx={{ flex: 1, minHeight: 200, display: "flex", border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden", bgcolor: "background.paper", minWidth: 0 }}>
          {/* Left sidebar: commits list */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {loadingCommits ? (
              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} variant="rounded" height={52} />
                ))}
              </Box>
            ) : commits.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary" variant="body2">No commits in this branch yet.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {commits.map((c) => {
                  const isSelected = commitDiff?.commit.id === c.id;
                  return (
                    <ListItem key={c.id} disablePadding>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => handleCommitIdClick(c)}
                        disabled={loadingDiff}
                        sx={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          py: 1,
                          borderBottom: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontFamily="monospace" fontWeight={600} color={isSelected ? "primary.main" : "text.primary"}>
                          {c.id.slice(0, 7)}
                        </Typography>
                        <Typography variant="body2" noWrap sx={{ width: "100%", mt: 0.25 }} title={c.message || "(no message)"}>
                          {c.message || "(no message)"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.authorName ?? "—"} · {formatDate(c.createdAt)}
                        </Typography>
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>

          {/* Right: comparison view (file list + side-by-side diff) */}
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {!commitDiff && !loadingDiff && (
              <Box sx={{ flex: 1, display: "flex", alignItems: "flex-start", p: 3 }}>
                <Typography color="text.secondary">Select a commit to view changes</Typography>
              </Box>
            )}
            {loadingDiff && (
              <Box sx={{ flex: 1, display: "flex", alignItems: "flex-start", p: 3 }}>
                <Typography color="text.secondary">Loading changes…</Typography>
              </Box>
            )}
            {commitDiff && !loadingDiff && (() => {
              const diff = commitDiff.diff;
              const added = diff.added.map((a) => ({ path: a.path, mode: "added" as const, oldContent: undefined, newContent: a.content }));
              const removed = diff.removed.map((r) => ({ path: r.path, mode: "removed" as const, oldContent: r.content, newContent: undefined }));
              const modified = diff.modified.map((m) => ({
                path: m.path,
                mode: "modified" as const,
                oldContent: m.base.content,
                newContent: m.target.content,
              }));
              const fileList = [...added, ...removed, ...modified];
              const selectedFile = fileList.find((f) => f.path === selectedDiffFilePath) ?? fileList[0];

              if (fileList.length === 0) {
                return (
                  <Box sx={{ flex: 1, display: "flex", alignItems: "flex-start", p: 3 }}>
                    <Typography color="text.secondary">No file changes in this commit</Typography>
                  </Box>
                );
              }

              return (
                <>
                  <Box sx={{ borderBottom: 1, borderColor: "divider", p: 1, bgcolor: "action.hover" }}>
                    <Typography variant="caption" color="text.secondary">
                      {commitDiff.commit.message || "(no message)"} — {commitDiff.commit.authorName ?? "—"} · {formatDate(commitDiff.commit.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
                    <Box
                      sx={{
                        width: 220,
                        flexShrink: 0,
                        borderRight: 1,
                        borderColor: "divider",
                        overflow: "auto",
                        py: 0.5,
                      }}
                    >
                      {added.length > 0 && (
                        <>
                          <Typography variant="caption" sx={{ px: 1.5, py: 0.5, color: "success.main", fontWeight: 600 }}>Added</Typography>
                          {added.map((f) => (
                            <Box
                              key={f.path}
                              onClick={() => setSelectedDiffFilePath(f.path)}
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                cursor: "pointer",
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                bgcolor: selectedDiffFilePath === f.path ? "action.selected" : "transparent",
                                "&:hover": { bgcolor: "action.hover" },
                              }}
                            >
                              {f.path}
                            </Box>
                          ))}
                        </>
                      )}
                      {removed.length > 0 && (
                        <>
                          <Typography variant="caption" sx={{ px: 1.5, py: 0.5, color: "error.main", fontWeight: 600 }}>Removed</Typography>
                          {removed.map((f) => (
                            <Box
                              key={f.path}
                              onClick={() => setSelectedDiffFilePath(f.path)}
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                cursor: "pointer",
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                bgcolor: selectedDiffFilePath === f.path ? "action.selected" : "transparent",
                                "&:hover": { bgcolor: "action.hover" },
                              }}
                            >
                              {f.path}
                            </Box>
                          ))}
                        </>
                      )}
                      {modified.length > 0 && (
                        <>
                          <Typography variant="caption" sx={{ px: 1.5, py: 0.5, color: "warning.main", fontWeight: 600 }}>Modified</Typography>
                          {modified.map((f) => (
                            <Box
                              key={f.path}
                              onClick={() => setSelectedDiffFilePath(f.path)}
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                cursor: "pointer",
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                bgcolor: selectedDiffFilePath === f.path ? "action.selected" : "transparent",
                                "&:hover": { bgcolor: "action.hover" },
                              }}
                            >
                              {f.path}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden", p: 1 }}>
                      {selectedFile && (
                        canShowJdmDiff(
                          selectedFile.path,
                          selectedFile.oldContent,
                          selectedFile.newContent,
                          selectedFile.mode
                        ) ? (
                          <JdmDiffViewer
                            path={selectedFile.path}
                            oldContent={selectedFile.oldContent}
                            newContent={selectedFile.newContent}
                            mode={selectedFile.mode}
                          />
                        ) : (
                          <SideBySideDiffViewer
                            path={selectedFile.path}
                            oldContent={selectedFile.oldContent}
                            newContent={selectedFile.newContent}
                            mode={selectedFile.mode}
                          />
                        )
                      )}
                    </Box>
                  </Box>
                </>
              );
            })()}
          </Box>
        </Box>
      </Box>

        </Box>
      </Box>

      {createMRModal && (
        <AppModal
          open={createMRModal}
          onClose={() => setCreateMRModal(false)}
          title="Create merge request"
          submitLabel={creatingMR ? "Creating…" : "Create merge request"}
          onSubmit={handleCreateMergeRequest}
          submitDisabled={creatingMR || !mrTitle.trim() || mrSourceBranchId === mrTargetBranchId}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Source branch (to merge from)</InputLabel>
              <Select
                value={mrSourceBranchId}
                label="Source branch (to merge from)"
                onChange={(e) => setMrSourceBranchId(e.target.value)}
                disabled={creatingMR}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Target branch (to merge into)</InputLabel>
              <Select
                value={mrTargetBranchId}
                label="Target branch (to merge into)"
                onChange={(e) => setMrTargetBranchId(e.target.value)}
                disabled={creatingMR}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Title"
              placeholder="e.g. Add new rules for X"
              value={mrTitle}
              onChange={(e) => setMrTitle(e.target.value)}
              disabled={creatingMR}
              fullWidth
              required
            />
            <TextField
              size="small"
              label="Description (optional)"
              placeholder="Describe the changes..."
              value={mrDescription}
              onChange={(e) => setMrDescription(e.target.value)}
              disabled={creatingMR}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </AppModal>
      )}

      {createModal && (
        <AppModal
          open={createModal}
          onClose={() => setCreateModal(false)}
          title="Create new branch"
          submitLabel={creating ? "Creating…" : "Create"}
          onSubmit={() => handleCreateBranch(newBranchName)}
          submitDisabled={creating || !newBranchName.trim()}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Source branch</InputLabel>
              <Select
                value={sourceBranchId}
                label="Source branch"
                onChange={(e) => setSourceBranchId(e.target.value)}
                disabled={creating}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="New branch name"
              placeholder="e.g. feature/my-feature"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              disabled={creating}
              fullWidth
            />
          </Box>
        </AppModal>
      )}

      {deleteConfirm && (
        <AppModal
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete branch"
          submitLabel={deleting ? "Deleting…" : "Delete"}
          onSubmit={() => deleteConfirm && handleDeleteBranch(deleteConfirm)}
          submitDisabled={deleting}
          actions={
            <>
              <AppButton variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </AppButton>
              <AppButton
                variant="danger"
                onClick={() => deleteConfirm && handleDeleteBranch(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </AppButton>
            </>
          }
        >
          <Typography>
            Are you sure you want to delete the branch <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
          </Typography>
        </AppModal>
      )}

      {loadingMRDiff && (
        <Dialog open disableEscapeKeyDown>
          <DialogContent>
            <Typography>Loading file changes…</Typography>
          </DialogContent>
        </Dialog>
      )}

      {viewMR && (
        <Dialog
          open
          onClose={() => { setViewMR(null); setSelectedMRFilePath(null); }}
          maxWidth="lg"
          fullWidth
          className="branch-mgmt-diff-dialog"
          PaperProps={{ sx: { minHeight: "70vh", maxHeight: "90vh" } }}
        >
          <DialogTitle>{viewMR.mr.title}</DialogTitle>
          <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
              {branches.find((b) => b.id === viewMR.mr.sourceBranchId)?.name ?? "source"} →{" "}
              {branches.find((b) => b.id === viewMR.mr.targetBranchId)?.name ?? "target"}
              {viewMR.mr.description && ` · ${viewMR.mr.description}`}
            </Typography>
            {(() => {
              const d = viewMR.diff;
              const added = d.added.map((a) => ({ path: a.path, mode: "added" as const, oldContent: undefined, newContent: a.content }));
              const removed = d.removed.map((r) => ({ path: r.path, mode: "removed" as const, oldContent: r.content, newContent: undefined }));
              const modified = d.modified.map((m) => ({
                path: m.path,
                mode: "modified" as const,
                oldContent: m.base.content,
                newContent: m.target.content,
              }));
              const fileList = [...added, ...removed, ...modified];
              const selectedFile = fileList.find((f) => f.path === selectedMRFilePath) ?? fileList[0];

              if (fileList.length === 0) {
                return (
                  <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary">No file changes.</Typography>
                  </Box>
                );
              }

              return (
                <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
                  <Box
                    sx={{
                      width: 220,
                      flexShrink: 0,
                      borderRight: 1,
                      borderColor: "divider",
                      overflow: "auto",
                      py: 0.5,
                    }}
                  >
                    {added.length > 0 && (
                      <>
                        <Typography variant="caption" sx={{ px: 1.5, py: 0.5, color: "success.main", fontWeight: 600 }}>Added</Typography>
                        {added.map((f) => (
                          <Box
                            key={f.path}
                            onClick={() => setSelectedMRFilePath(f.path)}
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              cursor: "pointer",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              bgcolor: selectedMRFilePath === f.path ? "action.selected" : "transparent",
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            {f.path}
                          </Box>
                        ))}
                      </>
                    )}
                    {removed.length > 0 && (
                      <>
                        <Typography variant="caption" sx={{ px: 1.5, py: 0.5, color: "error.main", fontWeight: 600 }}>Removed</Typography>
                        {removed.map((f) => (
                          <Box
                            key={f.path}
                            onClick={() => setSelectedMRFilePath(f.path)}
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              cursor: "pointer",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              bgcolor: selectedMRFilePath === f.path ? "action.selected" : "transparent",
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            {f.path}
                          </Box>
                        ))}
                      </>
                    )}
                    {modified.length > 0 && (
                      <>
                        <Typography variant="caption" sx={{ px: 1.5, py: 0.5, color: "warning.main", fontWeight: 600 }}>Modified</Typography>
                        {modified.map((f) => (
                          <Box
                            key={f.path}
                            onClick={() => setSelectedMRFilePath(f.path)}
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              cursor: "pointer",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              bgcolor: selectedMRFilePath === f.path ? "action.selected" : "transparent",
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            {f.path}
                          </Box>
                        ))}
                      </>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden", p: 1 }}>
                    {selectedFile &&
                      (canShowJdmDiff(
                        selectedFile.path,
                        selectedFile.oldContent,
                        selectedFile.newContent,
                        selectedFile.mode
                      ) ? (
                        <JdmDiffViewer
                          path={selectedFile.path}
                          oldContent={selectedFile.oldContent}
                          newContent={selectedFile.newContent}
                          mode={selectedFile.mode}
                        />
                      ) : (
                        <SideBySideDiffViewer
                          path={selectedFile.path}
                          oldContent={selectedFile.oldContent}
                          newContent={selectedFile.newContent}
                          mode={selectedFile.mode}
                        />
                      ))}
                  </Box>
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <AppButton variant="secondary" onClick={() => { setViewMR(null); setSelectedMRFilePath(null); }}>
              Close
            </AppButton>
            {canMergeMR && (
              <AppButton
                variant="primary"
                disabled={mergingMRId !== null}
                onClick={() => handlePerformMerge(viewMR.mr)}
              >
                {mergingMRId === viewMR.mr.id ? "Merging…" : "Merge"}
              </AppButton>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
