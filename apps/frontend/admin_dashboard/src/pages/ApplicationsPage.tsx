import type { GridItem } from "../components/common/GridCard";

import { useState, useEffect } from "react";
import CreateApplication from "../components/popups/CreateApplication";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import RotateKeyDialog from "../components/dialogs/RotateKeyDialog";
import TableFilterBar from "../components/common/TableFilterBar";
import { applicationsCardActions } from "../data/cardActions";
import GridLayout from "../layouts/GridLayout";
import ListLayout from "../layouts/ListLayout";
import { useRightDrawer } from "../contexts/RightDrawerContext";
import { useViewToggle } from "../hooks/useViewToggle";
import EditApplication from "../components/forms/EditApplication";
import { useTableFilters, type TableFilterConfig } from "../hooks/useTableFilters";
import { getAllApplications, deleteApplication, updateApplication } from "../services/applicationsApi";

const FILTER_CONFIG: TableFilterConfig = {
  searchableFields: ["title", "description"],
  sortableFields: ["title", "active"],
  filterableFields: ["active"],
};

const ApplicationsPage = () => {
  const [items, setItems] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [rotateKeyItemId, setRotateKeyItemId] = useState<string | null>(null);
  const { openDrawer } = useRightDrawer();
  const { currentView } = useViewToggle();

  // Load applications from API
  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const applications = await getAllApplications();
      const gridItems: GridItem[] = applications.map(app => ({
        id: app.id,
        title: app.name,
        description: app.description,
        active: app.isActive,
      }));
      setItems(gridItems);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setError(error instanceof Error ? error.message : 'Failed to load applications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
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
      const app = items.find(item => item.id === itemId);
      if (app) {
        await updateApplication(itemId, { isActive: !app.active });
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, active: !item.active } : item,
          ),
        );
      }
    } catch (error) {
      console.error('Failed to update application status:', error);
      alert('Failed to update application status');
    }
  };

  const handleCardClick = (itemId: string) => {
    openDrawer(<EditApplication itemId={itemId} isEditable={false} />, false, loadApplications);
  };

  const handleActionClick = (actionId: string, itemId: string) => {
    if (actionId === "edit") {
      openDrawer(<EditApplication itemId={itemId} isEditable={true} />, false, loadApplications);
    } else if (actionId === "delete") {
      setDeleteItemId(itemId);
      (document.getElementById("delete-app-modal") as HTMLDialogElement)?.showModal();
    } else if (actionId === "rotate") {
      setRotateKeyItemId(itemId);
      (document.getElementById("rotate-key-modal") as HTMLDialogElement)?.showModal();
    } else {
      console.log(actionId, itemId);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteItemId) {
      try {
        await deleteApplication(deleteItemId);
        setItems((prev) => prev.filter((item) => item.id !== deleteItemId));
        setDeleteItemId(null);
      } catch (error) {
        console.error('Failed to delete application:', error);
        alert('Failed to delete application');
      }
    }
  };

  const itemsWithActions = filteredItems.map((item) => ({
    ...item,
    actions: applicationsCardActions.map((action) => ({
      ...action,
      onClick: () => handleActionClick(action.id, item.id),
    })),
  }));

  const layoutProps = {
    items: itemsWithActions,
    onCreate: () =>
      (
        document.getElementById("create-app-modal") as HTMLDialogElement
      )?.showModal(),
    onStatusToggle: handleStatusToggle,
    onCardClick: handleCardClick,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div>
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadApplications}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TableFilterBar
        columns={[
          { key: "title", label: "Name" },
          { key: "active", label: "Status" },
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
      <CreateApplication />
      <ConfirmationDialog
        id="delete-app-modal"
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="error"
        onConfirm={handleDeleteConfirm}
      />
      {rotateKeyItemId && (
        <RotateKeyDialog
          id="rotate-key-modal"
          applicationId={rotateKeyItemId}
          applicationName={items.find((item) => item.id === rotateKeyItemId)?.title || "Application"}
        />
      )}
    </>
  );
};

export default ApplicationsPage;
