import { type ReactNode } from "react";
import { type RouteObject } from "react-router";

import ApplicationsPage from "../pages/ApplicationsPage";
import HomePage from "../pages/HomePage";
import ServicesPage from "../pages/ServicesPage";
import { AppWindowMacIcon, HomeIcon, MonitorCogIcon } from "lucide-react";

export type AppRoute = RouteObject & {
  icon?: ReactNode;
  name?: string;
  description?: string;
}

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    element: <HomePage />,
    name: "Home",
    description: "Home",
    icon: <HomeIcon className="h-4 w-4" />
  },
  {
    path: "/services",
    element: <ServicesPage />,
    name: "Services",
    description: "Manage services",
    icon: <MonitorCogIcon className="h-4 w-4" />
  },
  {
    path: "/applications",
    element: <ApplicationsPage />,
    name: "Applications",
    description: "Manage applications",
    icon: <AppWindowMacIcon className="h-4 w-4" />
  },
];
