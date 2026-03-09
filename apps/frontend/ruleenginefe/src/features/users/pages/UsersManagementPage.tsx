import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../auth/services/auth";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  isApiError,
  type User,
  type CreateUserBody,
  type UpdateUserBody,
} from "../../dashboard/services/api";
import { AppButton, AppInput, AppModal } from "../../../components/ui";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const GLOBAL_ROLES = ["ADMIN", "MAINTAINER", "DEVELOPER", "VIEWER"] as const;

function filterUsersBySearch(users: User[], query: string): User[] {
  const q = query.trim().toLowerCase();
  if (!q) return users;
  return users.filter(
    (u) =>
      (u.name?.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q)
  );
}

export function UsersManagementPage() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState<string>("DEVELOPER");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<string>("DEVELOPER");

  const [userSearch, setUserSearch] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";
  const filteredUsers = useMemo(() => filterUsersBySearch(users, userSearch), [users, userSearch]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listUsers(0, 200);
    setLoading(false);
    if (isApiError(res)) {
      setError(res.message);
      setUsers([]);
      return;
    }
    setUsers(res.data ?? []);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAdmin, navigate]);

  function openEdit(u: User) {
    setEditUser(u);
    setEditName(u.name ?? "");
    setEditRole(u.role ?? "DEVELOPER");
  }

  async function handleCreate() {
    if (!createEmail.trim() || !createPassword || createPassword.length < 8) {
      setError("Email and password (min 8 characters) are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const body: CreateUserBody = {
      email: createEmail.trim().toLowerCase(),
      password: createPassword,
      name: createName.trim() || undefined,
      role: createRole as CreateUserBody["role"],
    };
    const res = await createUser(body);
    setSaving(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setCreateOpen(false);
    setCreateEmail("");
    setCreatePassword("");
    setCreateName("");
    setCreateRole("DEVELOPER");
    loadUsers();
  }

  async function handleUpdate() {
    if (!editUser) return;
    setSaving(true);
    setError(null);
    const body: UpdateUserBody = {
      name: editName.trim() || null,
      role: editRole as UpdateUserBody["role"],
    };
    const res = await updateUser(editUser.id, body);
    setSaving(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setEditUser(null);
    loadUsers();
  }

  async function handleDelete() {
    if (!deleteUserTarget) return;
    if (deleteUserTarget.id === currentUser?.id) {
      setError("You cannot delete your own user.");
      return;
    }
    setDeleting(true);
    setError(null);
    const res = await deleteUser(deleteUserTarget.id);
    setDeleting(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setDeleteUserTarget(null);
    loadUsers();
  }

  if (!isAdmin) return null;

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          User management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create, update, and delete users. Assign global roles (ADMIN, MAINTAINER, DEVELOPER, VIEWER).
          Use &quot;Workspace &amp; repo access&quot; to grant users access to specific repositories.
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <AppButton variant="primary" onClick={() => setCreateOpen(true)} sx={{ mb: 2 }}>
          Create user
        </AppButton>

        <AppInput
          placeholder="Search by name or email…"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          size="small"
          sx={{ mb: 2, maxWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Typography color="text.secondary">Loading users…</Typography>
        ) : (
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <List disablePadding>
              {filteredUsers.map((u) => (
                <ListItem
                  key={u.id}
                  divider
                  sx={{ flexWrap: "wrap", gap: 1, alignItems: "center" }}
                >
                  <ListItemText
                    primary={u.name || u.email}
                    secondary={u.email}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Typography variant="caption" sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1 }}>
                    {u.role}
                  </Typography>
                  {u.id === currentUser?.id && (
                    <Typography variant="caption" color="primary.main">(you)</Typography>
                  )}
                  <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                    <AppButton variant="secondary" size="small" onClick={() => openEdit(u)}>
                      Edit
                    </AppButton>
                    {u.id !== currentUser?.id && (
                      <AppButton
                        variant="danger"
                        size="small"
                        onClick={() => setDeleteUserTarget(u)}
                      >
                        Delete
                      </AppButton>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
            {filteredUsers.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">
                  {users.length === 0 ? "No users yet. Create one above." : "No users match your search."}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>

      <AppModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create user"
        submitLabel={saving ? "Creating…" : "Create"}
        onSubmit={handleCreate}
        submitDisabled={saving || !createEmail.trim() || createPassword.length < 8}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
          <AppInput
            label="Email"
            type="email"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            disabled={saving}
            required
          />
          <AppInput
            label="Password"
            type="password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            disabled={saving}
            helperText="Min 8 characters"
            required
          />
          <AppInput
            label="Name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            disabled={saving}
            placeholder="Optional"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={createRole}
              label="Role"
              onChange={(e) => setCreateRole(e.target.value)}
              disabled={saving}
            >
              {GLOBAL_ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </AppModal>

      <AppModal
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        title="Edit user"
        submitLabel={saving ? "Saving…" : "Save"}
        onSubmit={handleUpdate}
        submitDisabled={saving}
      >
        {editUser && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
            <AppInput label="Email" value={editUser.email} disabled />
            <AppInput
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={saving}
              placeholder="Optional"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={editRole}
                label="Role"
                onChange={(e) => setEditRole(e.target.value)}
                disabled={saving}
              >
                {GLOBAL_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </AppModal>

      <AppModal
        open={Boolean(deleteUserTarget)}
        onClose={() => setDeleteUserTarget(null)}
        title="Delete user"
        submitLabel={deleting ? "Deleting…" : "Delete"}
        onSubmit={handleDelete}
        submitDisabled={deleting}
      >
        {deleteUserTarget && (
          <Typography>
            Delete user <strong>{deleteUserTarget.name || deleteUserTarget.email}</strong>? This cannot be undone.
          </Typography>
        )}
      </AppModal>
    </Box>
  );
}
