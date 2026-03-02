import type { CellColorConfig } from "../types/table";

/**
 * Cell color configurations for different tables
 * These are dynamic and customizable based on cell values
 */

// Configuration for HTTP method colors
export const httpMethodColorConfig: CellColorConfig = {
    columnKey: ["routeMethod", "method"],
    rules: [
        {
            matchType: "exact",
            value: ["GET"],
            badgeVariant: "success",
        },
        {
            matchType: "exact",
            value: ["POST"],
            badgeVariant: "warning",
        },
        {
            matchType: "exact",
            value: ["PUT"],
            badgeVariant: "info",
        },
        {
            matchType: "exact",
            value: ["DELETE"],
            badgeVariant: "error",
        },
        {
            matchType: "exact",
            value: ["PATCH"],
            badgeVariant: "secondary",
        },
    ],
};
