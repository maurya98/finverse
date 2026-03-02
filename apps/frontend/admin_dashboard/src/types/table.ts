export type CellColorMatchType = "exact" | "startsWith" | "endsWith" | "contains";

export interface CellColorRule {
  matchType: CellColorMatchType;
  value: string | string[];
  textColor?: string;
  backgroundColor?: string;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

export interface CellColorConfig {
  columnKey: string | string[];
  rules: CellColorRule[];
}

export interface TableColumn<T> {
    key: keyof T;
    label: string;
    width?: string;
    pinned?: boolean;
    sortable?: boolean;
    wrap?: boolean;
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
    renderCell?: (row: T, col: TableColumn<T>, rowIndex: number) => React.ReactNode;
    cellColorConfigs?: CellColorConfig[];
}

export interface ClientPermission {
    id?: string;
    routeUrl: string;
    routeMethod: string;
    scope: 'READ' | 'WRITE' | 'FULL';
    description: string;
    isActive: boolean;
    routeId: string;
}

export interface ServiceRoute {
    id?: string;
    name: string;
    description: string;
    isActive: boolean;
    exposedPath: string;
    actualPath: string;
    method: string;
}
