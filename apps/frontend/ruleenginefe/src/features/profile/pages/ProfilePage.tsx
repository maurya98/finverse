import { useState, useEffect, useCallback } from "react";
import { setUser } from "../../auth/services/auth";
import { getMe, updateProfile, isApiError, type User } from "../../dashboard/services/api";
import { AppButton, AppInput } from "../../../components/ui";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";

export function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getMe();
    setLoading(false);
    if (isApiError(res)) {
      setError(res.message);
      setProfile(null);
      return;
    }
    if (res.data) {
      setProfile(res.data);
      setName(res.data.name ?? "");
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSaveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    setError(null);
    setSuccess(null);
    const res = await updateProfile({ name: name.trim() || null });
    setSavingProfile(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    if (res.data) {
      const updated = res.data;
      setUser({ id: updated.id, email: updated.email, name: updated.name, role: updated.role ?? "DEVELOPER" });
      setProfile(updated);
      setSuccess("Profile updated.");
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    setError(null);
    setSuccess(null);
    const res = await updateProfile({
      currentPassword,
      newPassword,
    });
    setSavingPassword(false);
    if (isApiError(res)) {
      setError(res.message);
      return;
    }
    setSuccess("Password changed.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", minHeight: 200, p: 2 }}>
        <Typography color="text.secondary">Loading profile…</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error || "Failed to load profile."}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
      <Box sx={{ maxWidth: 560, p: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Profile
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Personal details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your email cannot be changed. Update your display name below.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <AppInput
              label="Email"
              value={profile.email}
              disabled
              helperText="Read-only"
            />
            <AppInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              disabled={savingProfile}
            />
            <AppButton
              variant="primary"
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </AppButton>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Change password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your current password and a new password (min 8 characters).
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <AppInput
              type="password"
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={savingPassword}
              autoComplete="current-password"
            />
            <AppInput
              type="password"
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={savingPassword}
              autoComplete="new-password"
            />
            <AppInput
              type="password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={savingPassword}
              autoComplete="new-password"
            />
            <AppButton
              variant="primary"
              onClick={handleChangePassword}
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {savingPassword ? "Updating…" : "Change password"}
            </AppButton>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
