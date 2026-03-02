import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from "react";

type ViewType = "grid" | "list";

const STORAGE_KEY = "view-toggle-preference";

interface ViewToggleContextType {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  toggleView: () => void;
}

const ViewToggleContext = createContext<ViewToggleContextType | undefined>(undefined);

export const ViewToggleProvider = ({ children }: { children: ReactNode }) => {
  const [currentView, setCurrentView] = useState<ViewType>("grid");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedView = localStorage.getItem(STORAGE_KEY) as ViewType | null;
      if (savedView === "grid" || savedView === "list") {
        setCurrentView(savedView);
      }
    } catch (error) {
      console.warn("Failed to load view preference from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

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

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

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

export const useViewToggle = () => {
  const context = useContext(ViewToggleContext);
  if (context === undefined) {
    throw new Error("useViewToggle must be used within a ViewToggleProvider");
  }
  return context;
};
