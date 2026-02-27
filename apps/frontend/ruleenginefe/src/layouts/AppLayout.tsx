import { Outlet, useNavigate, useLocation } from "react-router-dom";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Logout from "@mui/icons-material/Logout";
import { useState, useRef } from "react";
import { getUser } from "../features/auth/services/auth";
import { logout } from "../features/auth/services/authApi";
import { ThemePicker } from "../components/ThemePicker";
import { KeyboardShortcutsHelp, KeyboardShortcutsTrigger, type KeyboardShortcutsHelpHandle } from "../components/KeyboardShortcutsHelp";
import Box from "@mui/material/Box";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const shortcutsRef = useRef<KeyboardShortcutsHelpHandle>(null);

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%" }}>
      <MuiAppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Typography
            component="span"
            variant="h6"
            sx={{ fontWeight: 600, cursor: "pointer", mr: 2 }}
            onClick={() => navigate("/dashboard")}
          >
            Rule Engine
          </Typography>
          <Button
            color="inherit"
            sx={{ color: location.pathname === "/dashboard" && !location.pathname.startsWith("/dashboard/repo") ? "primary.main" : "text.primary" }}
            onClick={() => navigate("/dashboard")}
          >
            Repositories
          </Button>
          <Button
            color="inherit"
            sx={{ color: location.pathname === "/dashboard/logs" ? "primary.main" : "text.primary" }}
            onClick={() => navigate("/dashboard/logs")}
          >
            Logs
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <KeyboardShortcutsTrigger onClick={() => shortcutsRef.current?.open()} />
          <ThemePicker />
          <Button
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ textTransform: "none" }}
          >
            {user?.email ?? "User"}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Log out</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </MuiAppBar>
      <KeyboardShortcutsHelp ref={shortcutsRef} />
      <Box component="main" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", width: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
