import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { ThemePicker } from "../../../components/ThemePicker";
import "./RepositorySettingsPage.css";

export function RepositorySettingsPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const navigate = useNavigate();
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
      <div className="repo-settings-page">
        <div className="repo-settings-loading">{error || "Loading…"}</div>
      </div>
    );
  }

  if (!myRole || myRole === null) {
    return (
      <div className="repo-settings-page">
        <header className="repo-settings-header">
          <button type="button" className="repo-settings-back" onClick={() => navigate(`/dashboard/repo/${repositoryId}`)}>
            ← Editor
          </button>
          <h1 className="repo-settings-title">{repo.name} — Settings</h1>
          <ThemePicker />
        </header>
        <div className="repo-settings-forbidden">You are not a member of this repository or you do not have access.</div>
      </div>
    );
  }

  return (
    <div className="repo-settings-page">
      <header className="repo-settings-header">
        <button type="button" className="repo-settings-back" onClick={() => navigate(`/dashboard/repo/${repositoryId}`)}>
          ← Editor
        </button>
        <h1 className="repo-settings-title">
          {repo.name} <span className="repo-settings-repo-id">({repo.id})</span> — Settings
        </h1>
        <ThemePicker />
      </header>

      <main className="repo-settings-main">
        <nav className="repo-settings-breadcrumb">
          <button type="button" className="repo-settings-breadcrumb-link" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <span className="repo-settings-breadcrumb-sep">/</span>
          <button type="button" className="repo-settings-breadcrumb-link" onClick={() => navigate(`/dashboard/repo/${repositoryId}`)}>
            {repo.name}
          </button>
          <span className="repo-settings-breadcrumb-sep">/</span>
          <span className="repo-settings-breadcrumb-current">Members</span>
        </nav>

        <section className="repo-settings-section">
          <h2 className="repo-settings-section-title">Repository members</h2>
          {!canManage && (
            <p className="repo-settings-muted">Only admins and maintainers can manage members. Your role: {myRole}.</p>
          )}
          {canManage && (
            <button type="button" className="repo-settings-btn primary" onClick={() => setAddModal(true)}>
              Add member
            </button>
          )}
          {error && <div className="repo-settings-error">{error}</div>}
          <div className="repo-settings-members">
            {members.length === 0 ? (
              <p className="repo-settings-empty">No members yet.</p>
            ) : (
              <ul className="repo-settings-member-list">
                {members.map((m) => (
                  <li key={m.id} className="repo-settings-member-item">
                    <span className="repo-settings-member-email">{m.userEmail ?? m.userId}</span>
                    {m.userName && <span className="repo-settings-member-name">{m.userName}</span>}
                    {canManage ? (
                      <select
                        className="repo-settings-member-role-select"
                        value={m.role}
                        onChange={(e) => handleUpdateRole(m, e.target.value as RepositoryMemberRole)}
                        disabled={updatingUserId !== null || isLastAdmin(m)}
                        title={isLastAdmin(m) ? "Cannot demote the last admin" : ""}
                      >
                        <option value="VIEWER">VIEWER</option>
                        <option value="CONTRIBUTOR">CONTRIBUTOR</option>
                        <option value="MAINTAINER">MAINTAINER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      <span className="repo-settings-member-role-badge">{m.role}</span>
                    )}
                    {canManage && m.userId !== user?.id && !isLastAdmin(m) && (
                      <button
                        type="button"
                        className="repo-settings-btn danger small"
                        disabled={removingUserId !== null}
                        onClick={() => handleRemoveMember(m)}
                      >
                        {removingUserId === m.userId ? "Removing…" : "Remove"}
                      </button>
                    )}
                    {m.userId === user?.id && <span className="repo-settings-member-you">(you)</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      {addModal && (
        <div className="repo-settings-modal-backdrop" onClick={() => setAddModal(false)} role="presentation">
          <div className="repo-settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="repo-settings-modal-title">Add member</h3>
            <label className="repo-settings-modal-label">User</label>
            <select
              className="repo-settings-modal-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={adding}
            >
              <option value="">Select a user</option>
              {users
                .filter((u) => !members.some((m) => m.userId === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} {u.name ? `(${u.name})` : ""}
                  </option>
                ))}
            </select>
            <label className="repo-settings-modal-label">Role</label>
            <select
              className="repo-settings-modal-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RepositoryMemberRole)}
              disabled={adding}
            >
              <option value="VIEWER">VIEWER</option>
              <option value="CONTRIBUTOR">CONTRIBUTOR</option>
              <option value="MAINTAINER">MAINTAINER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="repo-settings-modal-actions">
              <button type="button" className="repo-settings-modal-btn secondary" onClick={() => setAddModal(false)} disabled={adding}>
                Cancel
              </button>
              <button
                type="button"
                className="repo-settings-modal-btn primary"
                disabled={adding || !selectedUserId}
                onClick={handleAddMember}
              >
                {adding ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
