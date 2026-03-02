import { useMemo } from "react";
import { type TableProps } from "../../types/table";
import { getColumnColorConfig, getCellColorRule, badgeColors } from "../../utils/cellColorUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Table = <T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  pinHeaderRows = 1,
  maxHeight = "24rem",
  maxWidth,
  striped = true,
  hover = true,
  compact = false,
  className,
  renderCell,
  cellColorConfigs,
}: TableProps<T>) => {
  // Separate pinned and unpinned columns
  const { pinnedCols, unpinnedCols } = useMemo(
    () => ({
      pinnedCols: columns.filter((col) => col.pinned),
      unpinnedCols: columns.filter((col) => !col.pinned),
    }),
    [columns],
  );

  // Calculate left positions and z-indices for pinned columns
  const { pinnedColPositions, pinnedColZIndices } = useMemo(() => {
    const positions: Record<string, string> = {};
    const zIndices: Record<string, number> = {};
    let leftPosition = 0;

    pinnedCols.forEach((col, index) => {
      positions[String(col.key)] = `${leftPosition}px`;
      // Higher z-index for leftmost columns so they stay on top
      zIndices[String(col.key)] = 50 - index;
      // Parse width (e.g., "80px" -> 80)
      const width = col.width ? parseInt(col.width) : 100;
      leftPosition += width;
    });

    return { pinnedColPositions: positions, pinnedColZIndices: zIndices };
  }, [pinnedCols]);

  const tableSize = compact ? "table-xs" : "table-sm";

  // Helper function to render cell with optional color coding
  const renderCellContent = (row: T, col: typeof columns[0], rowIndex: number) => {
    const cellValue = String(row[col.key] ?? "-");
    
    // If custom renderCell is provided, use it
    if (renderCell) {
      return renderCell(row, col, rowIndex);
    }

    // Check if there's a color config for this column
    const colorConfig = getColumnColorConfig(String(col.key), cellColorConfigs);
    
    if (colorConfig) {
      const matchedRule = getCellColorRule(cellValue, colorConfig.rules);
      
      if (matchedRule && matchedRule.badgeVariant) {
        const badgeClass = badgeColors[matchedRule.badgeVariant];
        return (
          <div className={`badge ${badgeClass} badge-sm whitespace-nowrap`}>
            {cellValue}
          </div>
        );
      }
    }

    return cellValue;
  };

  const tableClassNames = [
    "table",
    tableSize,
    pinHeaderRows > 0 && "table-pin-rows",
    striped && "[&_tbody_tr:nth-child(odd)]:bg-base-200",
    hover && "[&_tbody_tr]:hover:bg-base-300",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`overflow-x-auto ${className || ""}`}
      style={{
        height: maxHeight,
        maxWidth: maxWidth,
      }}
    >
      <table
        className={tableClassNames}
        style={{
          tableLayout: "fixed",
        }}
      >
        <thead>
          {Array.from({ length: pinHeaderRows }).map((_, headerIndex) => (
            <tr
              key={headerIndex}
              style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
              }}
            >
              {pinnedCols.map((col) => (
                <th
                  key={String(col.key)}
                  style={{
                    width: col.width,
                    position: "sticky",
                    left: pinnedColPositions[String(col.key)],
                    zIndex: pinnedColZIndices[String(col.key)],
                  }}
                  className="bg-base-100"
                >
                  {col.label}
                </th>
              ))}
              {unpinnedCols.map((col) => (
                <th
                  key={String(col.key)}
                  style={{ width: col.width, position: "sticky" }}
                  className="bg-base-100"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-base-content/50"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={String(row[rowKey]) || rowIndex} style={{ position: "relative", zIndex: 1 }}>
                {pinnedCols.map((col) => (
                  <td
                    key={String(col.key)}
                    style={{
                      width: col.width,
                      position: "sticky",
                      left: pinnedColPositions[String(col.key)],
                      zIndex: pinnedColZIndices[String(col.key)] - 40,
                      wordBreak: col.wrap ? "break-word" : undefined,
                    }}
                    className="bg-base-100"
                  >
                    {renderCellContent(row, col, rowIndex)}
                  </td>
                ))}
                {unpinnedCols.map((col) => (
                  <td 
                    key={String(col.key)} 
                    style={{ 
                      width: col.width,
                      wordBreak: col.wrap ? "break-word" : undefined,
                    }}
                  >
                    {renderCellContent(row, col, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
