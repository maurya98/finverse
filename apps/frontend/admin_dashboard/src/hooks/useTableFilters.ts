import { useMemo, useState, useCallback } from "react";

export interface FilterState {
  searchQuery: string;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  columnFilters: Record<string, string>;
}

export interface TableFilterConfig {
  searchableFields: string[];
  sortableFields: string[];
  filterableFields: string[];
}

/**
 * Hook for managing table filtering, sorting, and searching
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTableFilters = <T extends Record<string, any>>(
  data: T[],
  config: TableFilterConfig,
) => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: "",
    sortField: null,
    sortDirection: "asc",
    columnFilters: {},
  });

  // Apply filters, sorting, and searching
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search query
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase();
      result = result.filter((item) =>
        config.searchableFields.some((field) =>
          String(item[field] ?? "").toLowerCase().includes(query),
        ),
      );
    }

    // Apply column filters
    Object.entries(filterState.columnFilters).forEach(([field, value]) => {
      if (value) {
        result = result.filter((item) => String(item[field] ?? "") === value);
      }
    });

    // Apply sorting
    if (filterState.sortField) {
      result.sort((a, b) => {
        const aVal = a[filterState.sortField!];
        const bVal = b[filterState.sortField!];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const aStr = String(aVal);
        const bStr = String(bVal);

        const comparison =
          typeof aVal === "string" && typeof bVal === "string"
            ? aStr.localeCompare(bStr)
            : aVal < bVal
              ? -1
              : aVal > bVal
                ? 1
                : 0;

        return filterState.sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filterState, config]);

  const setSearchQuery = useCallback((query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setSortField = useCallback(
    (field: string | null) => {
      setFilterState((prev) => ({
        ...prev,
        sortField: field,
        sortDirection: prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
      }));
    },
    [],
  );

  const setColumnFilter = useCallback((field: string, value: string) => {
    setFilterState((prev) => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [field]: value,
      },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState({
      searchQuery: "",
      sortField: null,
      sortDirection: "asc",
      columnFilters: {},
    });
  }, []);

  return {
    filteredData,
    filterState,
    setSearchQuery,
    setSortField,
    setColumnFilter,
    clearFilters,
  };
};

/**
 * Get unique values for a column
 */
export const getUniqueColumnValues = (data: object[], field: string): string[] => {
  const values = new Set<string>();
  data.forEach((item: object) => {
    const val = (item as Record<string, object>)[field];
    if (val !== null && val !== undefined) {
      values.add(String(val));
    }
  });
  return Array.from(values).sort();
};
