import { createContext, type ReactNode, useState, useCallback } from "react";

type ViewType = "grid" | "list";

const STORAGE_KEY = "view-toggle-preference";

interface ViewToggleContextType {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  toggleView: () => void;
}

const ViewToggleContext = createContext<ViewToggleContextType | undefined>(undefined);

export { ViewToggleContext };

export const ViewToggleProvider = ({ children }: { children: ReactNode }) => {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    try {
      const savedView = localStorage.getItem(STORAGE_KEY) as ViewType | null;
      return savedView === "grid" || savedView === "list" ? savedView : "grid";
    } catch {
      return "grid";
    }
  });

  const toggleView = useCallback(() => {
    setCurrentView((prev) => {
      const newView = prev === "grid" ? "list" : "grid";
      try {
        localStorage.setItem(STORAGE_KEY, newView);
      } catch (error) {
        console.warn("Failed to save view preference to localStorage:", error);
      }
      return newView;
    });
  }, []);

  const handleSetView = useCallback((view: ViewType) => {
    setCurrentView(view);
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch (error) {
      console.warn("Failed to save view preference to localStorage:", error);
    }
  }, []);

  return (
    <ViewToggleContext.Provider
      value={{
        currentView,
        setView: handleSetView,
        toggleView,
      }}
    >
      {children}
    </ViewToggleContext.Provider>
  );
};
