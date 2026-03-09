import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProtectedRoute } from "./features/auth/pages/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { RepoLayout } from "./layouts/RepoLayout";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { RepositoryEditorPage } from "./features/dashboard/pages/RepositoryEditorPage";
import { RepositorySettingsPage } from "./features/dashboard/pages/RepositorySettingsPage";
import { BranchManagementPage } from "./features/dashboard/pages/BranchManagementPage";
import { LogsPage } from "./features/logs/pages/LogsPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import { UsersManagementPage } from "./features/users/pages/UsersManagementPage";
import { UserAccessPage } from "./features/users/pages/UserAccessPage";

function App() {
  return (
    <BrowserRouter basename="/ruleenginefe">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users" element={<UsersManagementPage />} />
          <Route path="users/access" element={<UserAccessPage />} />
          <Route path="repo/:repositoryId" element={<RepoLayout />}>
            <Route index element={<RepositoryEditorPage />} />
            <Route path="branches" element={<BranchManagementPage />} />
            <Route path="settings" element={<RepositorySettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
