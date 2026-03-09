import { useState } from "react";
import { SidebarIcon, Grid3x3, List, FileUp, LogOut, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useViewToggle } from "../../hooks/useViewToggle";
import ImportExportDialog from "./ImportExportDialog";
import { useAuth } from "../../contexts/AuthContext";

interface NavbarProps {
  title?: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentView, setView } = useViewToggle();
  const { user, logout } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Map routes to titles
  const routeTitles: Record<string, string> = {
    "/": "Home",
    "/services": "Services",
    "/applications": "Applications",
  };

  const displayTitle = title || routeTitles[location.pathname] || "Admin Dashboard";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar w-full bg-base-200">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <label
            htmlFor="my-drawer-4"
            aria-label="open sidebar"
            className="btn btn-square btn-ghost"
          >
            <SidebarIcon className="h-4 w-4" />
          </label>
          <div className="px-4 font-bold">{displayTitle}</div>
        </div>

        {/* View Toggle Button Group and Import/Export */}
        <div className="flex items-center gap-2">
          {location.pathname !== "/" && (
            <div className="btn-group">
              <button
                type="button"
                className={`btn btn-sm ${currentView === "grid" ? "btn-active" : ""}`}
                onClick={() => setView("grid")}
                title="Grid View"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`btn btn-sm ${currentView === "list" ? "btn-active" : ""}`}
                onClick={() => setView("list")}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* Import/Export Button */}
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setIsDialogOpen(true)}
            title="Import/Export Data"
          >
            <FileUp className="h-4 w-4" />
          </button>

          {/* User Menu */}
          {user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm btn-ghost gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
                <span className="badge badge-sm badge-primary">{user.role}</span>
              </div>
              <ul tabIndex={0} className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
                <li className="menu-title">
                  <span>{user.email}</span>
                </li>
                <li>
                  <button onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <ImportExportDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </nav>
  );
};

export default Navbar;
