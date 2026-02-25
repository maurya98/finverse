import { SidebarIcon } from "lucide-react";
import { useLocation } from "react-router";

interface NavbarProps {
  title?: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const location = useLocation();

  // Map routes to titles
  const routeTitles: Record<string, string> = {
    "/": "Home",
    "/services": "Services",
    "/applications": "Applications",
  };

  const displayTitle = title || routeTitles[location.pathname] || "Admin Dashboard";

  return (
    <nav className="navbar w-full bg-base-200 ">
      <div className="flex items-center justify-center">
        <label
          htmlFor="my-drawer-4"
          aria-label="open sidebar"
          className="btn btn-square btn-ghost"
        >
          <SidebarIcon className="h-4 w-4" />
        </label>
        <div className="px-4 font-bold">{displayTitle}</div>
      </div>
    </nav>
  );
};

export default Navbar;
