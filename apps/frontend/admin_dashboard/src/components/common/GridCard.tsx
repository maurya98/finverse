import { type ReactNode } from "react";

export type GridAction = {
  id: string;
  icon: ReactNode;
  tooltip?: string;
  variant?: "ghost" | "error" | "primary" | "neutral";
  onClick?: () => void;
};

export type GridItem = {
  id: string;
  title: string;
  description?: string;
  active?: boolean;
  actions?: GridAction[];
};

interface Props {
  item: GridItem;
  showDescription?: boolean;
  showStatus?: boolean;
  onStatusToggle?: (itemId: string) => void;
  onCardClick?: (itemId: string) => void;
}

const GridCard = ({
  item,
  showDescription = true,
  showStatus = true,
  onStatusToggle,
  onCardClick,
}: Props) => {
  return (
    <div
      onClick={() => onCardClick?.(item.id)}
      className="bg-base-200 rounded-xl aspect-square flex flex-col gap-4 text-left p-4 items-stretch justify-between cursor-pointer hover:bg-base-300 transition-colors"
    >
      <div>
        <span className="font-bold line-clamp-2 block" title={item.title}>
          {item.title}
        </span>
        {showDescription && item.description ? (
          <span className="text-xs text-muted-foreground line-clamp-3 block mt-2">
            {item.description}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between w-full">
        {showStatus ? (
          <div className="tooltip" data-tip="Toggle Status">
            <button
              type="button"
              onClick={() => onStatusToggle?.(item.id)}
              className={`badge text-xs cursor-pointer transition-all ${item.active ? "badge-success" : "badge-ghost"}`}
            >
              {item.active ? "Active" : "Inactive"}
            </button>
          </div>
        ) : null}

        <div className="flex gap-1">
          {item.actions?.map((a) => (
            <div key={a.id} className="tooltip" data-tip={a.tooltip}>
              <button
                type="button"
                onClick={a.onClick}
                className={`btn btn-sm ${a.variant === "error" ? "btn-error" : "btn-ghost"} btn-square`}
              >
                {a.icon}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridCard;
