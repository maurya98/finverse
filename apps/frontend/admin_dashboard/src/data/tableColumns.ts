import type { TableColumn } from "../types/table";
import type { ClientPermission, ServiceRoute } from "../types/table";

export const clientPermissionColumns: TableColumn<ClientPermission>[] = [
    {
        key: "id",
        label: "ID",
        width: "120px",
        pinned: true,
        wrap: true,
    },
    {
        key: "routeUrl",
        label: "Route URL",
        width: "250px",
    },
    {
        key: "routeMethod",
        label: "Route Method",
        width: "80px",
    },
    {
        key: "scope",
        label: "Scope",
        width: "100px",
    },
    {
        key: "description",
        label: "Description",
        width: "250px",
    },
    {
        key: "isActive",
        label: "Active",
        width: "90px",
    },
];

export const serviceRouteColumns: TableColumn<ServiceRoute>[] = [
    {
        key: "id",
        label: "ID",
        width: "120px",
        pinned: true,
        wrap: true,
    },
    {
        key: "name",
        label: "Route Name",
        width: "150px",
    },
    {
        key: "actualPath",
        label: "Actual Path",
        width: "250px",
    },
    {
        key: "exposedPath",
        label: "Exposed Path",
        width: "250px",
    },
    {
        key: "method",
        label: "Method",
        width: "80px",
    },
    {
        key: "description",
        label: "Description",
        width: "250px",
    },
    {
        key: "isActive",
        label: "Active",
        width: "90px",
    },
];
