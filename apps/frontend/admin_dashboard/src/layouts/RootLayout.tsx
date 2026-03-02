import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Navbar from "../components/common/Navbar";
import SidebarList from "../components/common/SidebarList";
import RightDrawer from "../components/common/RightDrawer";
import {
  RightDrawerProvider,
  useRightDrawer,
} from "../contexts/RightDrawerContext";
import { ViewToggleProvider } from "../contexts/ViewToggleContext";

const RootLayoutContent = () => {
  const { isVisible, isExpanded, content, toggleExpand, closeDrawer } =
    useRightDrawer();
  const location = useLocation();

  // Close drawer when route changes
  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page content here */}
        <div className="flex flex-1 min-h-0">
          {/* Main page */}
          <div
            className={`overflow-auto transition-all duration-300 ${
              isExpanded ? "hidden" : "flex-1 min-w-0"
            }`}
          >
            <div className="@container p-4">
              <Outlet />
            </div>
          </div>

          {/* Right Drawer */}
          <RightDrawer
            isVisible={isVisible}
            isExpanded={isExpanded}
            onToggleExpand={toggleExpand}
            onClose={closeDrawer}
          >
            {content}
          </RightDrawer>
        </div>
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-16 is-drawer-open:w-64 p-1">
          {/* Sidebar content here */}
          <SidebarList />
        </div>
      </div>
    </div>
  );
};

const RootLayout = () => {
  return (
    <ViewToggleProvider>
      <RightDrawerProvider>
        <RootLayoutContent />
      </RightDrawerProvider>
    </ViewToggleProvider>
  );
};

export default RootLayout;
