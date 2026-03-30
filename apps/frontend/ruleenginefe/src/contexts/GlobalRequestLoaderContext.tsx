import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getInFlightCount, subscribeToRequestTracker } from "../services/requestTracker";
import { GlobalRequestLoader } from "../components/ui/GlobalRequestLoader";

type GlobalRequestLoaderContextValue = {
  inFlightCount: number;
  isLoading: boolean;
};

const GlobalRequestLoaderContext = createContext<GlobalRequestLoaderContextValue | null>(null);

export function GlobalRequestLoaderProvider({ children }: { children: ReactNode }) {
  const [inFlightCount, setInFlightCount] = useState(() => getInFlightCount());
  const isLoading = inFlightCount > 0;

  // Debounce to avoid flashing loader for very fast requests.
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setIsOverlayVisible(false);
      return;
    }
    const t = window.setTimeout(() => setIsOverlayVisible(true), 150);
    return () => window.clearTimeout(t);
  }, [isLoading]);

  useEffect(() => {
    return subscribeToRequestTracker(setInFlightCount);
  }, []);

  const value = useMemo(
    () => ({
      inFlightCount,
      isLoading,
    }),
    [inFlightCount, isLoading]
  );

  return (
    <GlobalRequestLoaderContext.Provider value={value}>
      {children}
      <GlobalRequestLoader open={isOverlayVisible} />
    </GlobalRequestLoaderContext.Provider>
  );
}

export function useGlobalRequestLoader() {
  const ctx = useContext(GlobalRequestLoaderContext);
  if (!ctx) throw new Error("useGlobalRequestLoader must be used within GlobalRequestLoaderProvider");
  return ctx;
}

