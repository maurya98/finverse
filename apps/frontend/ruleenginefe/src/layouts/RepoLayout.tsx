import { useEffect, useState } from "react";
import { Outlet, useParams, useSearchParams, Link, useLocation, useMatch } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import { getRepository } from "../features/dashboard/services/api";
import type { RepositoryMemberRole } from "../features/dashboard/services/api";
import { RepoRoleProvider } from "../features/dashboard/contexts/RepoRoleContext";

export function RepoLayout() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const branch = searchParams.get("branch") ?? "main";
  const [repo, setRepo] = useState<{
    id: string;
    name: string;
    defaultBranch: string;
    currentUserRole?: RepositoryMemberRole;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!repositoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getRepository(repositoryId).then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setRepo({
          id: res.data.id,
          name: res.data.name,
          defaultBranch: res.data.defaultBranch,
          currentUserRole: res.data.currentUserRole,
        });
      } else {
        setRepo(null);
      }
    });
  }, [repositoryId]);

  const settingsMatch = useMatch("/dashboard/repo/:repositoryId/settings");
  const branchesMatch = useMatch("/dashboard/repo/:repositoryId/branches");
  const tabValue =
    settingsMatch ? "settings" :
    branchesMatch ? "branches" :
    "code";

  const canManageRepo = repo?.currentUserRole != null &&
    ["ADMIN", "MAINTAINER"].includes(repo.currentUserRole);
  /** When on settings but user has no Settings tab, show indicator on code to avoid MUI mismatch */
  const effectiveTabValue = tabValue === "settings" && !canManageRepo ? "code" : tabValue;

  if (!repositoryId) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Invalid repository.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="text" width={100} height={24} />
          <Skeleton variant="text" width={24} height={24} />
          <Skeleton variant="text" width={180} height={24} />
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider", display: "flex", gap: 2 }}>
          <Skeleton variant="text" width={48} height={32} />
          <Skeleton variant="text" width={72} height={32} />
          <Skeleton variant="text" width={64} height={32} />
        </Box>
        <Box sx={{ flex: 1, p: 2 }}>
          <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={120} />
        </Box>
      </Box>
    );
  }

  return (
    <RepoRoleProvider
      repositoryId={repositoryId}
      currentUserRole={repo?.currentUserRole ?? null}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          bgcolor: "background.default",
        }}
      >
        {/* Repo bar — breadcrumb + branch */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            bgcolor: "background.paper",
          }}
        >
          <Typography
            component={Link}
            to="/dashboard"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Repositories
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            /
          </Typography>
          <Typography
            component={Link}
            to={`/dashboard/repo/${repositoryId}?branch=${encodeURIComponent(branch)}`}
            sx={{
              color: "text.primary",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {repo?.name ?? "…"}
          </Typography>
          {repo && (
            <Chip
              label={branch}
              size="small"
              variant="outlined"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                height: 22,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={effectiveTabValue}
          sx={{
            minHeight: 40,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "0.875rem" },
            "& .MuiTabs-indicator": { height: 2 },
          }}
        >
          <Tab
            label="Code"
            value="code"
            component={Link}
            to={`/dashboard/repo/${repositoryId}?branch=${encodeURIComponent(branch)}`}
          />
          <Tab
            label="Branches"
            value="branches"
            component={Link}
            to={`/dashboard/repo/${repositoryId}/branches?branch=${encodeURIComponent(branch)}`}
          />
          {canManageRepo && (
            <Tab
              label="Settings"
              value="settings"
              component={Link}
              to={`/dashboard/repo/${repositoryId}/settings`}
            />
          )}
        </Tabs>

        <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Outlet />
        </Box>
      </Box>
    </RepoRoleProvider>
  );
}
