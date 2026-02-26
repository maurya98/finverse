import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getRepository,
  listRepositoryMembers,
  addRepositoryMember,
  updateRepositoryMemberRole,
  removeRepositoryMember,
  getMyRepositoryRole,
  listUsers,
  isApiError,
  type RepositoryMember,
  type RepositoryMemberRole,
  type User,
} from "../services/api";
import { getUser } from "../../auth/services/auth";
import { getTokenRole } from "../../auth/services/auth";
import { AppButton } from "../../../components/ui/AppButton";
import { AppModal } from "../../../components/ui/AppModal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import "./RepositorySettingsPage.css";

export function RepositorySettingsPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const user = getUser();
  const [repo, setRepo] = useState<{ id: string; name: string } | null>(null);
  const [myRole, setMyRole] = useState<RepositoryMemberRole | null>(null);
  const [members, setMembers] = useState<RepositoryMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<RepositoryMemberRole>("VIEWER");
  const [adding, setAdding] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const canManage = myRole === "ADMIN" || myRole === "MAINTAINER";
  const tokenRole = getTokenRole();

  const loadRepoAndRole = useCallback(async () => {
    if (!repositoryId) return;
    const [repoRes, roleRes] = await Promise.all([
      getRepository(repositoryId),
      getMyRepositoryRole(repositoryId),
    ]);
    if (isApiError(repoRes)) {
      setError(repoRes.message);
      setRepo(null);
      setMyRole(null);
      return;
    }
    if (repoRes.data) setRepo({ id: repoRes.data.id, name: repoRes.data.name });
    if (!isApiError(roleRes) && roleRes.data) setMyRole(roleRes.data.role);
    else setMyRole(null);
  }, [repositoryId]);

  const loadMembers = useCallback(async () => {
    if (!repositoryId) return;
    const res = await listRepositoryMembers(repositoryId);
    if (isApiError(res)) {
      setError(res.message);
      setMembers([]);
      return;
    }
    setMembers(res.data ?? []);
  }, [repositoryId]);

  useEffect(() => {
    loadRepoAndRole();
  }, [loadRepoAndRole]);

  useEffect(() => {
    if (myRole && (myRole === "ADMIN" || myRole === "VIEWER" || myRole === "CONTRIBUTOR" || myRole === "MAINTAINER")) {
      loadMembers();
    }
  }, [repositoryId, myRole, loadMembers]);

  useEffect(() => {
    if (addModal && users.length === 0) {
      listUsers(0, 200).then((res) => {
        if (!isApiError(res) && res.data) setUsers(res.data);
      });
    }
  }, [addModal]);

  async function handleAddMember() {
    if (!repositoryId || !selectedUserId || !user?.id) return;
    setAdding(true);
    setError(null);
    const res = await addRepositoryMember(repositoryId, selectedUserId, selectedRole);
    setAdding(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setAddModal(false);
    setSelectedUserId("");
    setSelectedRole("VIEWER");
    loadMembers();
  }

  async function handleUpdateRole(m: RepositoryMember, newRole: RepositoryMemberRole) {
    if (!repositoryId) return;
    setUpdatingUserId(m.userId);
    setError(null);
    const res = await updateRepositoryMemberRole(repositoryId, m.userId, newRole);
    setUpdatingUserId(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    loadMembers();
  }

  async function handleRemoveMember(m: RepositoryMember) {
    if (!repositoryId) return;
    setRemovingUserId(m.userId);
    setError(null);
    const res = await removeRepositoryMember(repositoryId, m.userId);
    setRemovingUserId(null);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    loadMembers();
  }

  const adminCount = members.filter((m) => m.role === "ADMIN").length;
  const isLastAdmin = (m: RepositoryMember) => m.role === "ADMIN" && adminCount <= 1;

  if (!repo) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", minHeight: 200, p: 2 }}>
        <Typography color="text.secondary">{error || "Loading…"}</Typography>
      </Box>
    );
  }

  if (!myRole || myRole === null) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">
          You are not a member of this repository or you do not have access.
        </Alert>
      </Box>
    );
  }

  return (
      <Box className="repo-settings-page" sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      <Box sx={{ width: "100%", boxSizing: "border-box", p: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Repository members
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Account role: <strong>{tokenRole ?? "—"}</strong>. Your role in this repository: <strong>{myRole}</strong>.
          Only repository <strong>ADMIN</strong> and <strong>MAINTAINER</strong> can add or manage members.
        </Typography>
        {!canManage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You cannot add or manage members because your repository role is {myRole}. Only ADMIN and MAINTAINER can.
          </Alert>
        )}
        {canManage && (
          <AppButton variant="primary" size="small" onClick={() => setAddModal(true)} sx={{ mb: 2 }}>
            Add member
          </AppButton>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {members.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No members yet.
          </Typography>
        ) : (
          <List disablePadding sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
            {members.map((m) => (
              <ListItem
                key={m.id}
                divider
                sx={{ flexWrap: "wrap", gap: 1, alignItems: "center" }}
              >
                <ListItemText
                  primary={m.userEmail ?? m.userId}
                  secondary={m.userName}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
                {canManage ? (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={m.role}
                      onChange={(e) => handleUpdateRole(m, e.target.value as RepositoryMemberRole)}
                      disabled={updatingUserId !== null || isLastAdmin(m)}
                      title={isLastAdmin(m) ? "Cannot demote the last admin" : ""}
                      displayEmpty
                    >
                      <MenuItem value="VIEWER">VIEWER</MenuItem>
                      <MenuItem value="CONTRIBUTOR">CONTRIBUTOR</MenuItem>
                      <MenuItem value="MAINTAINER">MAINTAINER</MenuItem>
                      <MenuItem value="ADMIN">ADMIN</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="caption" sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}>
                    {m.role}
                  </Typography>
                )}
                {canManage && m.userId !== user?.id && !isLastAdmin(m) && (
                  <AppButton
                    variant="danger"
                    size="small"
                    disabled={removingUserId !== null}
                    onClick={() => handleRemoveMember(m)}
                  >
                    {removingUserId === m.userId ? "Removing…" : "Remove"}
                  </AppButton>
                )}
                {m.userId === user?.id && (
                  <Typography variant="caption" color="primary.main">
                    (you)
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {addModal && (
        <AppModal
          className="repo-settings-modal"
          open={addModal}
          onClose={() => setAddModal(false)}
          title="Add member"
          submitLabel={adding ? "Adding…" : "Add"}
          onSubmit={handleAddMember}
          submitDisabled={adding || !selectedUserId}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>User</InputLabel>
              <Select
                value={selectedUserId}
                label="User"
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={adding}
                displayEmpty
              >
                <MenuItem value="">Select a user</MenuItem>
                {users
                  .filter((u) => !members.some((m) => m.userId === u.id))
                  .map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.email} {u.name ? `(${u.name})` : ""}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                label="Role"
                onChange={(e) => setSelectedRole(e.target.value as RepositoryMemberRole)}
                disabled={adding}
              >
                <MenuItem value="VIEWER">VIEWER</MenuItem>
                <MenuItem value="CONTRIBUTOR">CONTRIBUTOR</MenuItem>
                <MenuItem value="MAINTAINER">MAINTAINER</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </AppModal>
      )}
    </Box>
    </Box>
  );
}
