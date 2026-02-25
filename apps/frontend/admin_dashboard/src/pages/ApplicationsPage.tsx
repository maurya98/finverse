import type { GridItem } from "../components/common/GridCard";

import { useState } from "react";
import CreateApplication from "../components/popups/CreateApplication";
import { applicationsCardActions } from "../data/cardActions";
import GridLayout from "../layouts/GridLayout";
import { generateGridItems } from "../utils/gridUtils";
import { useRightDrawer } from "../contexts/RightDrawerContext";
import EditApplication from "../components/forms/EditApplication";

const ApplicationsPage = () => {
  const mapActionsToItem = (item: GridItem) => ({
    ...item,
    actions: applicationsCardActions.map((action) => ({
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
    openDrawer(<EditApplication itemId={itemId} />);
  };

  return (
    <>
      <GridLayout
        items={items}
        onCreate={() =>
          (
            document.getElementById("create-app-modal") as HTMLDialogElement
          )?.showModal()
        }
        onStatusToggle={handleStatusToggle}
        onCardClick={handleCardClick}
      />
      <CreateApplication />
    </>
  );
};

export default ApplicationsPage;
