import { PlusIcon } from "lucide-react";
import { type GridItem } from "../components/common/GridCard";
import GridCard from "../components/common/GridCard";
import { useRightDrawer } from "../contexts/RightDrawerContext";

export interface GridLayoutProps {
  items: GridItem[];
  onCreate?: () => void;
  onStatusToggle?: (itemId: string) => void;
  onCardClick?: (itemId: string) => void;
  createLabel?: string;
  showDescription?: boolean; // default true
  showStatus?: boolean; // default true
  columnsClassName?: string; // optional override for grid columns
}

const GridLayout = ({
  items,
  onCreate,
  onStatusToggle,
  onCardClick,
  createLabel = "Create",
  showDescription = true,
  showStatus = true,
  columnsClassName = "grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4",
}: GridLayoutProps) => {
  const { openDrawer } = useRightDrawer();

  const handleCardClick = (itemId: string) => {
    if (onCardClick) {
      onCardClick(itemId);
    } else {
      openDrawer(null);
    }
  };

  return (
    <div className={`grid ${columnsClassName} gap-4 p-4`}>
      {/* Create card */}
      <div
        role={onCreate ? "button" : undefined}
        onClick={onCreate}
        className="rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer border-base-content/10 hover:border-secondary hover:text-secondary transition-colors"
      >
        <PlusIcon />
        {createLabel}
      </div>

      {items.map((it) => (
        <GridCard
          key={it.id}
          item={it}
          showDescription={showDescription}
          showStatus={showStatus}
          onStatusToggle={onStatusToggle}
          onCardClick={() => handleCardClick(it.id)}
        />
      ))}
    </div>
  );
};

export default GridLayout;
