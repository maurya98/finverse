import { useState } from "react";
import type { GridItem } from "../components/common/GridCard";
import EditService from "../components/forms/EditService";
import CreateService from "../components/popups/CreateService";
import { useRightDrawer } from "../contexts/RightDrawerContext";
import { servicesCardActions } from "../data/cardActions";
import GridLayout from "../layouts/GridLayout";
import { generateGridItems } from "../utils/gridUtils";

const ServicesPage = () => {
  const mapActionsToItem = (item: GridItem) => ({
    ...item,
    actions: servicesCardActions.map((action) => ({
      ...action,
      onClick: () => console.log(action.id, item.id),
    })),
  });

  const [items, setItems] = useState<GridItem[]>(
    generateGridItems(6).map(mapActionsToItem),
  );

  const handleStatusToggle = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, active: !item.active } : item,
      ),
    );
  };

  const { openDrawer } = useRightDrawer();

  const handleCardClick = (itemId: string) => {
    openDrawer(<EditService itemId={itemId} />);
  };

  return (
    <>
      <GridLayout
        items={items}
        onCardClick={handleCardClick}
        onCreate={() =>
          (
            document.getElementById("create-service-modal") as HTMLDialogElement
          )?.showModal()
        }
        onStatusToggle={handleStatusToggle}
      />
      <CreateService />
    </>
  );
};

export default ServicesPage;
