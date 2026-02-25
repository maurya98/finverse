export interface TableColumn<T> {
    key: keyof T;
    label: string;
    width?: string;
    pinned?: boolean;
    sortable?: boolean;
}

export interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    rowKey: keyof T;
    pinHeaderRows?: number;
    maxHeight?: string;
    maxWidth?: string;
    striped?: boolean;
    hover?: boolean;
    compact?: boolean;
    className?: string;
}

export interface ClientPermission {
    id: string;
    routeUrl: string;
    routeMethod: string;
    description: string;
    isActive: boolean;
}

export const clientPermissionColumns: TableColumn<ClientPermission>[] = [
    {
        key: "id",
        label: "ID",
        width: "90px",
        pinned: true,
    },
    {
        key: "routeUrl",
        label: "Route URL",
        width: "150px",
    },
    {
        key: "routeMethod",
        label: "Route Method",
        width: "200px",
    },
    {
        key: "description",
        label: "Description",
        width: "250px",
    },
    {
        key: "isActive",
        label: "Active",
        width: "150px",
    },
];

export interface ServiceRoute {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    exposedPath: string;
    actualPath: string;
    method: string;
}

export const serviceRouteColumns: TableColumn<ServiceRoute>[] = [
    {
        key: "id",
        label: "ID",
        width: "90px",
        pinned: true,
    },
    {
        key: "exposedPath",
        label: "Exposed Path",
        width: "150px",
    },
    {
        key: "method",
        label: "Method",
        width: "200px",
    },
    {
        key: "description",
        label: "Description",
        width: "250px",
    },
    {
        key: "isActive",
        label: "Active",
        width: "150px",
    },
];
