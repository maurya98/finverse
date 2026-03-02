import type { CellColorRule, CellColorConfig } from "../types/table";

/**
 * Check if a cell value matches a color rule
 */
export function matchesCellColorRule(cellValue: string, rule: CellColorRule): boolean {
  const value = String(cellValue).toLowerCase();
  const compareValues = Array.isArray(rule.value) ? rule.value : [rule.value];

  switch (rule.matchType) {
    case "exact":
      return compareValues.some((v) => v.toLowerCase() === value);
    case "startsWith":
      return compareValues.some((v) => value.startsWith(v.toLowerCase()));
    case "endsWith":
      return compareValues.some((v) => value.endsWith(v.toLowerCase()));
    case "contains":
      return compareValues.some((v) => value.includes(v.toLowerCase()));
    default:
      return false;
  }
}

/**
 * Get the color rule that matches a cell value
 */
export function getCellColorRule(
  cellValue: string,
  rules: CellColorRule[],
): CellColorRule | null {
  for (const rule of rules) {
    if (matchesCellColorRule(cellValue, rule)) {
      return rule;
    }
  }
  return null;
}

/**
 * Get the color config for a specific column
 */
export function getColumnColorConfig(
  columnKey: string,
  cellColorConfigs?: CellColorConfig[],
): CellColorConfig | null {
  if (!cellColorConfigs) return null;
  return cellColorConfigs.find((config) => {
    const configKeys = Array.isArray(config.columnKey) ? config.columnKey : [config.columnKey];
    return configKeys.includes(columnKey);
  }) || null;
}

/**
 * Get badge variant colors for DaisyUI badges
 */
export const badgeColors: Record<string, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  info: "badge-info",
};
