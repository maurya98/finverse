import React from "react";
import type { TableColumn } from "../types/table";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RowData = Record<string, any>;

interface EditableCellConfig {
  textFields?: string[];
  booleanFields?: string[];
  colorCodeFields?: string[];
  selectFields?: Record<string, string[]>;
}

/**
 * Generates JSX for an editable table cell based on field type and configuration
 * @param row The current row data
 * @param col The column definition
 * @param onChange Callback function when cell value changes
 * @param config Configuration specifying which fields are text, boolean, etc.
 * @param rowIndex The index of the row in the table
 * @returns JSX element for the editable cell
 */
export const generateEditableCellRenderer = (
  row: RowData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  col: TableColumn<any>,
  onChange: (id: string | undefined, rowIndex: number, field: string, value: string | boolean) => void,
  config: EditableCellConfig = {},
  rowIndex: number = 0,
): React.ReactNode => {
  const { textFields = [], booleanFields = [], colorCodeFields = [], selectFields = {} } = config;
  const fieldKey = String(col.key);

  // Handle ID field - show empty for new rows (no ID yet)
  if (fieldKey === "id") {
    if (!row.id) {
      return React.createElement("span", { className: "text-base-content/50" }, "-");
    }
    return String(row.id);
  }

  // Handle boolean/checkbox fields
  if (booleanFields.includes(fieldKey)) {
    return React.createElement(
      "div",
      { className: "focus-within:border-b focus-within:border-base-content/15 px-1 py-0.5 flex items-center justify-center" },
      React.createElement("input", {
        type: "checkbox",
        className: "checkbox checkbox-sm",
        checked: Boolean(row[fieldKey]),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(row.id, rowIndex, fieldKey, e.target.checked);
        },
      }),
    );
  }

  // Handle select fields
  if (fieldKey in selectFields) {
    const options = selectFields[fieldKey];
    return React.createElement(
      "div",
      { className: "focus-within:border-b focus-within:border-base-content/15 px-1 py-0.5" },
      React.createElement("select", {
        className: "bg-transparent border-none outline-none w-full text-sm",
        value: String(row[fieldKey] ?? ""),
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
          onChange(row.id, rowIndex, fieldKey, e.target.value);
        },
      },
        options.map(opt =>
          React.createElement("option", { key: opt, value: opt }, opt)
        )
      ),
    );
  }

  // Handle text fields (including color-coded fields)
  if (textFields.includes(fieldKey) || colorCodeFields.includes(fieldKey)) {
    return React.createElement(
      "div",
      { className: "focus-within:border-b focus-within:border-base-content/15 px-1 py-0.5" },
      React.createElement("input", {
        type: "text",
        className: "bg-transparent border-none outline-none w-full text-sm",
        value: String(row[fieldKey] ?? ""),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(row.id, rowIndex, fieldKey, e.target.value);
        },
      }),
    );
  }

  // Default: render as text
  return String(row[fieldKey] ?? "-");
};

/**
 * Predefined configurations for common entity types
 */
export const EDITABLE_CELL_CONFIGS = {
  clientPermission: {
    textFields: ["routeUrl", "routeMethod", "description"],
    selectFields: {
      scope: ["READ", "WRITE", "FULL"],
    },
    booleanFields: ["isActive"],
    colorCodeFields: ["routeMethod"],
  } as EditableCellConfig,

  serviceRoute: {
    textFields: ["name", "exposedPath", "actualPath", "method", "description"],
    booleanFields: ["isActive"],
    colorCodeFields: ["method"],
  } as EditableCellConfig,
};
