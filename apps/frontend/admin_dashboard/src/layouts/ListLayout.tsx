import { type GridItem } from "../components/common/GridCard";

export interface ListLayoutProps {
  items: GridItem[];
  onCreate?: () => void;
  onStatusToggle?: (itemId: string) => void;
  onCardClick?: (itemId: string) => void;
  createLabel?: string;
  columnsClassName?: string;
}

const ListLayout = ({
  items,
  onCreate,
  onStatusToggle,
  onCardClick,
  createLabel = "Create",
}: ListLayoutProps) => {
  return (
    <div className="p-4">
      <div className="flex mb-4">
        {onCreate && (
          <button
            onClick={onCreate}
            className="btn btn-primary btn-sm"
          >
            + {createLabel}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm [&_tbody_tr:nth-child(odd)]:bg-base-200">
          <thead>
            <tr>
              <th className="w-1/3">Title</th>
              <th className="w-1/3">Description</th>
              <th className="w-24">Status</th>
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onCardClick?.(item.id)}
                className="hover:bg-base-300 cursor-pointer"
              >
                <td className="font-semibold">{item.title}</td>
                <td className="text-sm text-gray-600 max-w-xs truncate">
                  {item.description || "-"}
                </td>
                <td>
                  <div className="tooltip" data-tip="Toggle Status">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusToggle?.(item.id);
                      }}
                      className={`badge text-xs cursor-pointer transition-all ${
                        item.active ? "badge-success" : "badge-ghost"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    {item.actions?.map((a) => (
                      <div key={a.id} className="tooltip" data-tip={a.tooltip}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            a.onClick?.();
                          }}
                          className={`btn btn-xs ${
                            a.variant === "error" ? "btn-error" : "btn-ghost"
                          } btn-square`}
                        >
                          {a.icon}
                        </button>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No items found
          </div>
        )}
      </div>
    </div>
  );
};

export default ListLayout;
