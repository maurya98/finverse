import { FileEditIcon, RotateCwSquareIcon, Trash2Icon, EyeIcon, CopyIcon } from "lucide-react";
import type { GridAction } from "../components/common/GridCard";

/**
 * Card action definitions for all grid pages.
 * Each page imports its corresponding action array and customizes as needed.
 */

export const applicationsCardActions: Omit<GridAction, "onClick">[] = [
  {
    id: "edit",
    icon: <FileEditIcon className="h-4 w-4" />,
    tooltip: "Edit Application",
  },
  {
    id: "rotate",
    icon: <RotateCwSquareIcon className="h-4 w-4" />,
    tooltip: "Rotate Key",
  },
  {
    id: "delete",
    icon: <Trash2Icon className="h-4 w-4" />,
    tooltip: "Delete Application",
    variant: "error",
  },
];

export const servicesCardActions: Omit<GridAction, "onClick">[] = [
  {
    id: "edit",
    icon: <FileEditIcon className="h-4 w-4" />,
    tooltip: "Edit Service",
  },
  {
    id: "delete",
    icon: <Trash2Icon className="h-4 w-4" />,
    tooltip: "Delete Service",
    variant: "error",
  },
];

export const routesCardActions: Omit<GridAction, "onClick">[] = [
  {
    id: "edit",
    icon: <FileEditIcon className="h-4 w-4" />,
    tooltip: "Edit Route",
  },
  {
    id: "view",
    icon: <EyeIcon className="h-4 w-4" />,
    tooltip: "View Details",
  },
  {
    id: "delete",
    icon: <Trash2Icon className="h-4 w-4" />,
    tooltip: "Delete Route",
    variant: "error",
  },
];

export const routePermissionsCardActions: Omit<GridAction, "onClick">[] = [
  {
    id: "edit",
    icon: <FileEditIcon className="h-4 w-4" />,
    tooltip: "Edit Permission",
  },
  {
    id: "duplicate",
    icon: <CopyIcon className="h-4 w-4" />,
    tooltip: "Duplicate Permission",
  },
  {
    id: "delete",
    icon: <Trash2Icon className="h-4 w-4" />,
    tooltip: "Delete Permission",
    variant: "error",
  },
];
