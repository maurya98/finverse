import { useState, useEffect } from "react";
import type { GridItem } from "../components/common/GridCard";
import type { TableColumn } from "../types/table";
import EditService from "../components/forms/EditService";
import CreateService from "../components/popups/CreateService";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import TableFilterBar from "../components/common/TableFilterBar";
import { useRightDrawer } from "../contexts/RightDrawerContext";
import { useViewToggle } from "../hooks/useViewToggle";
import { servicesCardActions } from "../data/cardActions";
import GridLayout from "../layouts/GridLayout";
import ListLayout from "../layouts/ListLayout";
import { useTableFilters, type TableFilterConfig } from "../hooks/useTableFilters";
import { getAllServices, deleteService, updateService } from "../services/servicesApi";

const FILTER_CONFIG: TableFilterConfig = {
  searchableFields: ["title", "description"],
  sortableFields: ["title", "active"],
  filterableFields: ["active"],
};

const ServicesPage = () => {
  const [items, setItems] = useState<GridItem[]>([]);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const { openDrawer } = useRightDrawer();
  const { currentView } = useViewToggle();

  // Load services from API
  const loadServices = async () => {
    try {
      const services = await getAllServices();
      const gridItems: GridItem[] = services.map(service => ({
        id: service.id,
        title: service.name,
        description: service.description,
        active: service.isActive,
      }));
      setItems(gridItems);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const {
    filteredData: filteredItems,
    filterState,
    setSearchQuery,
    setSortField,
    setColumnFilter,
    clearFilters,
  } = useTableFilters(items, FILTER_CONFIG);

  const handleStatusToggle = async (itemId: string) => {
    try {
      const service = items.find(item => item.id === itemId);
      if (service) {
        await updateService(itemId, { isActive: !service.active });
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, active: !item.active } : item,
          ),
        );
      }
    } catch (error) {
      console.error('Failed to update service status:', error);
      alert('Failed to update service status');
    }
  };

  const handleCardClick = (itemId: string) => {
    openDrawer(<EditService itemId={itemId} isEditable={false} />, false, loadServices);
  };

  const handleActionClick = (actionId: string, itemId: string) => {
    if (actionId === "edit") {
      openDrawer(<EditService itemId={itemId} isEditable={true} />, false, loadServices);
    } else if (actionId === "delete") {
      setDeleteItemId(itemId);
      (document.getElementById("delete-service-modal") as HTMLDialogElement)?.showModal();
    } else {
      console.log(actionId, itemId);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteItemId) {
      try {
        await deleteService(deleteItemId);
        setItems((prev) => prev.filter((item) => item.id !== deleteItemId));
        setDeleteItemId(null);
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Failed to delete service');
      }
    }
  };

  const itemsWithActions = filteredItems.map((item) => ({
    ...item,
    actions: servicesCardActions.map((action) => ({
      ...action,
      onClick: () => handleActionClick(action.id, item.id),
    })),
  }));

  const layoutProps = {
    items: itemsWithActions,
    onCreate: () =>
      (
        document.getElementById("create-service-modal") as HTMLDialogElement
      )?.showModal(),
    onStatusToggle: handleStatusToggle,
    onCardClick: handleCardClick,
  };

  return (
    <>
      <TableFilterBar
        columns={[
          { key: "title", label: "Name" } as TableColumn<GridItem>,
          { key: "active", label: "Status" } as TableColumn<GridItem>,
        ]}
        data={items}
        searchQuery={filterState.searchQuery}
        onSearchChange={setSearchQuery}
        sortField={filterState.sortField}
        sortDirection={filterState.sortDirection}
        onSortChange={setSortField}
        columnFilters={filterState.columnFilters}
        onColumnFilterChange={setColumnFilter}
        onClearFilters={clearFilters}
        searchableFields={FILTER_CONFIG.searchableFields}
        sortableFields={FILTER_CONFIG.sortableFields}
        filterableFields={FILTER_CONFIG.filterableFields}
      />
      {currentView === "grid" ? (
        <GridLayout {...layoutProps} />
      ) : (
        <ListLayout {...layoutProps} />
      )}
      <CreateService />
      <ConfirmationDialog
        id="delete-service-modal"
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="error"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ServicesPage;
