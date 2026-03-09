import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../auth/services/auth";
import {
  listUsers,
  listWorkspaces,
  listRepositories,
  listRepositoryMembers,
  addRepositoryMember,
  updateRepositoryMemberRole,
  removeRepositoryMember,
  isApiError,
  type User,
  type Workspace,
  type Repository,
  type RepositoryMember,
  type RepositoryMemberRole,
} from "../../dashboard/services/api";
import { AppButton } from "../../../components/ui";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

const REPO_ROLES: RepositoryMemberRole[] = ["VIEWER", "CONTRIBUTOR", "MAINTAINER", "ADMIN"];

function getOptionLabel(user: User): string {
  return user.name ? `${user.name} (${user.email})` : user.email;
}

function filterUserOptions(options: User[], state: { inputValue: string }): User[] {
  const q = state.inputValue.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (u) =>
      (u.name?.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q)
  );
}

export function UserAccessPage() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);
  const [reposByWorkspace, setReposByWorkspace] = useState<Record<string, Repository[]>>({});
  const [membersByRepo, setMembersByRepo] = useState<Record<string, RepositoryMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "ADMIN";
  const selectedUser = useMemo(
    () => (selectedUserId ? users.find((u) => u.id === selectedUserId) ?? null : null),
    [users, selectedUserId]
  );

  const loadUsers = useCallback(async () => {
    const res = await listUsers(0, 200);
    if (isApiError(res)) {
      setError(res.message);
      setUsers([]);
      return;
    }
    setUsers(res.data ?? []);
  }, []);

  const loadWorkspaces = useCallback(async () => {
    setError(null);
    const res = await listWorkspaces({ all: true });
    if (isApiError(res)) {
      setError(res.message);
      setWorkspaces([]);
      return;
    }
    setWorkspaces(res.data ?? []);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setLoading(true);
    Promise.all([loadUsers(), loadWorkspaces()]).then(() => setLoading(false));
  }, [isAdmin, navigate, loadUsers, loadWorkspaces]);

  const loadReposForWorkspace = useCallback(async (workspaceId: string) => {
    const res = await listRepositories(workspaceId);
    if (isApiError(res)) {
      return;
    }
    const repos = res.data ?? [];
    setReposByWorkspace((prev) => ({ ...prev, [workspaceId]: repos }));
    for (const repo of repos) {
      const mRes = await listRepositoryMembers(repo.id);
      if (!isApiError(mRes) && mRes.data) {
        setMembersByRepo((prev) => ({ ...prev, [repo.id]: mRes.data! }));
      }
    }
  }, []);

  useEffect(() => {
    if (expandedWorkspaceId && !reposByWorkspace[expandedWorkspaceId]) {
      loadReposForWorkspace(expandedWorkspaceId);
    }
  }, [expandedWorkspaceId, reposByWorkspace, loadReposForWorkspace]);

  function toggleWorkspace(workspaceId: string) {
    setExpandedWorkspaceId((prev) => (prev === workspaceId ? null : workspaceId));
  }

  function getMemberInRepo(repositoryId: string): RepositoryMember | undefined {
    const members = membersByRepo[repositoryId] ?? [];
    return members.find((m) => m.userId === selectedUserId);
  }

  async function handleAddToRepo(repositoryId: string, role: RepositoryMemberRole) {
    if (!selectedUserId) return;
    setActionLoading(`add-${repositoryId}`);
    setError(null);
    const res = await addRepositoryMember(repositoryId, selectedUserId, role);
    setActionLoading(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    const mRes = await listRepositoryMembers(repositoryId);
    if (!isApiError(mRes) && mRes.data) {
      setMembersByRepo((prev) => ({ ...prev, [repositoryId]: mRes.data! }));
    }
  }

  async function handleUpdateRole(repositoryId: string, userId: string, role: RepositoryMemberRole) {
    setActionLoading(`update-${repositoryId}-${userId}`);
    setError(null);
    const res = await updateRepositoryMemberRole(repositoryId, userId, role);
    setActionLoading(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    const mRes = await listRepositoryMembers(repositoryId);
    if (!isApiError(mRes) && mRes.data) {
      setMembersByRepo((prev) => ({ ...prev, [repositoryId]: mRes.data! }));
    }
  }

  async function handleRemoveFromRepo(repositoryId: string, userId: string) {
    setActionLoading(`remove-${repositoryId}-${userId}`);
    setError(null);
    const res = await removeRepositoryMember(repositoryId, userId);
    setActionLoading(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    const mRes = await listRepositoryMembers(repositoryId);
    if (!isApiError(mRes) && mRes.data) {
      setMembersByRepo((prev) => ({ ...prev, [repositoryId]: mRes.data! }));
    }
  }

  if (!isAdmin) return null;

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", minHeight: 200, p: 2 }}>
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Workspace &amp; repo access
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a user, then expand workspaces to see repositories. Add the user to repositories and set their role per repo.
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Autocomplete
          value={selectedUser}
          onChange={(_, newValue: User | null) => setSelectedUserId(newValue?.id ?? "")}
          options={users}
          getOptionLabel={getOptionLabel}
          filterOptions={filterUserOptions}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          size="small"
          sx={{ mb: 2, maxWidth: 400 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search by name or email, then select a user"
              label="User"
            />
          )}
          noOptionsText="No users match your search"
          clearOnBlur={false}
        />

        {!selectedUserId ? (
          <Typography color="text.secondary">Select a user to manage their repository access.</Typography>
        ) : (
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <List disablePadding>
              {workspaces.map((ws) => {
                const repos = reposByWorkspace[ws.id] ?? [];
                const expanded = expandedWorkspaceId === ws.id;
                return (
                  <Box key={ws.id}>
                    <ListItemButton
                      onClick={() => toggleWorkspace(ws.id)}
                      sx={{ bgcolor: expanded ? "action.hover" : undefined }}
                    >
                      <ListItemText primary={ws.name} secondary={`Workspace · ${repos.length} repo(s)`} />
                      <IconButton size="small" aria-label={expanded ? "Collapse" : "Expand"}>
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </ListItemButton>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ pl: 2, pr: 2, pb: 2 }}>
                        {repos.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                            No repositories in this workspace.
                          </Typography>
                        )}
                        {repos.map((repo) => {
                          const member = getMemberInRepo(repo.id);
                          const isUpdating = actionLoading === `update-${repo.id}-${selectedUserId}` || actionLoading?.startsWith("add-" + repo.id) || actionLoading?.startsWith("remove-" + repo.id);
                          return (
                            <Paper key={repo.id} variant="outlined" sx={{ p: 1.5, mb: 1 }} elevation={0}>
                              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                <ListItemText
                                  primary={repo.name}
                                  primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                                />
                                {member ? (
                                  <>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                      <Select
                                        value={member.role}
                                        size="small"
                                        onChange={(e) => handleUpdateRole(repo.id, selectedUserId, e.target.value as RepositoryMemberRole)}
                                        disabled={isUpdating}
                                      >
                                        {REPO_ROLES.map((r) => (
                                          <MenuItem key={r} value={r}>{r}</MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                    <AppButton
                                      variant="danger"
                                      size="small"
                                      disabled={isUpdating}
                                      onClick={() => handleRemoveFromRepo(repo.id, selectedUserId)}
                                    >
                                      Remove
                                    </AppButton>
                                  </>
                                ) : (
                                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                    {REPO_ROLES.map((role) => (
                                      <AppButton
                                        key={role}
                                        variant="secondary"
                                        size="small"
                                        disabled={isUpdating}
                                        onClick={() => handleAddToRepo(repo.id, role)}
                                      >
                                        Add as {role}
                                      </AppButton>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            </Paper>
                          );
                        })}
                      </List>
                    </Collapse>
                  </Box>
                );
              })}
            </List>
            {workspaces.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">No workspaces. Create workspaces from the Repositories page.</Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}
