import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProtectedRoute } from "./features/auth/pages/ProtectedRoute";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { RepositoryEditorPage } from "./features/dashboard/pages/RepositoryEditorPage";
import { BranchManagementPage } from "./features/dashboard/pages/BranchManagementPage";
import { LogsPage } from "./features/logs/pages/LogsPage";

function App() {
  return (
    <BrowserRouter>
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
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/repo/:repositoryId"
          element={
            <ProtectedRoute>
              <RepositoryEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/repo/:repositoryId/branches"
          element={
            <ProtectedRoute>
              <BranchManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/logs"
          element={
            <ProtectedRoute>
              <LogsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
