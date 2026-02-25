import { createContext, useContext, ReactNode, useState, useCallback } from "react";

interface RightDrawerContextType {
  isVisible: boolean;
  isExpanded: boolean;
  content: ReactNode;
  openDrawer: (content: ReactNode, expanded?: boolean) => void;
  closeDrawer: () => void;
  toggleExpand: () => void;
}

const RightDrawerContext = createContext<RightDrawerContextType | undefined>(
  undefined
);

export const RightDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);

  const openDrawer = useCallback(
    (drawerContent: ReactNode, expanded = false) => {
      setContent(drawerContent);
      setIsVisible(true);
      setIsExpanded(expanded);
    },
    []
  );

  const closeDrawer = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <RightDrawerContext.Provider
      value={{
        isVisible,
        isExpanded,
        content,
        openDrawer,
        closeDrawer,
        toggleExpand,
      }}
    >
      {children}
    </RightDrawerContext.Provider>
  );
};

export const useRightDrawer = () => {
  const context = useContext(RightDrawerContext);
  if (!context) {
    throw new Error(
      "useRightDrawer must be used within RightDrawerProvider"
    );
  }
  return context;
};
