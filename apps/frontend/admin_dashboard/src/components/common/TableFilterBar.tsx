import { X, Search } from "lucide-react";
import type { TableColumn } from "../../types/table";
import { getUniqueColumnValues } from "../../hooks/useTableFilters";

interface TableFilterBarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: TableColumn<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  onSortChange: (field: string | null) => void;
  columnFilters: Record<string, string>;
  onColumnFilterChange: (field: string, value: string) => void;
  onClearFilters: () => void;
  searchableFields: string[];
  sortableFields: string[];
  filterableFields: string[];
}

const TableFilterBar = ({
  columns,
  data,
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  columnFilters,
  onColumnFilterChange,
  onClearFilters,
  sortableFields,
  filterableFields,
}: TableFilterBarProps) => {
  const hasActiveFilters =
    searchQuery || sortField || Object.values(columnFilters).some(Boolean);

  return (
    <div className="p-4 bg-base-200 rounded-lg flex flex-col md:flex-row items-start gap-4 justify-between">
      {/* Search Bar */}
      <div className="form-control w-full md:w-64">
        <label className="label pb-1">
          <span className="label-text text-xs">Search</span>
        </label>
        <label className="input input-bordered input-sm flex items-center gap-2 w-full">
          <Search className="h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="btn btn-ghost btn-xs"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </label>
      </div>

      {/* Sort and Filter Dropdowns */}
      <div className="flex gap-3 items-start">
        {/* Sort Dropdown */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs">Sort By</span>
          </label>
          <div className="flex flex-col gap-1">
            <select
              className="select select-bordered select-sm"
              value={sortField || ""}
              onChange={(e) => onSortChange(e.target.value || null)}
            >
              <option value="">None</option>
              {sortableFields
                .map((field) => columns.find((col) => String(col.key) === field))
                .filter(Boolean)
                .map((col) => (
                  <option key={String(col!.key)} value={String(col!.key)}>
                    {col!.label}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => onSortChange(sortField)}
              className={`text-xs ${
                sortField
                  ? "text-info cursor-pointer"
                  : "text-base-content/30 invisible"
              }`}
              title="Click to toggle sort direction"
              disabled={!sortField}
            >
              {sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        {filterableFields
          .map((field) => columns.find((col) => String(col.key) === field))
          .filter(Boolean)
          .map((col) => {
            const uniqueValues = getUniqueColumnValues(data, String(col!.key));
            if (uniqueValues.length === 0) return null;

            return (
              <div
                key={String(col!.key)}
                className="form-control"
              >
                <label className="label pb-1">
                  <span className="label-text text-xs">{col!.label}</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={columnFilters[String(col!.key)] || ""}
                  onChange={(e) =>
                    onColumnFilterChange(String(col!.key), e.target.value)
                  }
                >
                  <option value="">All</option>
                  {uniqueValues.map((val: string) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="btn btn-outline btn-sm mt-6.25"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default TableFilterBar;
