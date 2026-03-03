import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface RightDrawerContextType {
  isVisible: boolean;
  isExpanded: boolean;
  content: ReactNode;
  openDrawer: (content: ReactNode, expanded?: boolean, onClose?: () => void) => void;
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
  const [, setOnCloseCallback] = useState<(() => void) | null>(null);

  const openDrawer = useCallback(
    (drawerContent: ReactNode, expanded = false, onClose?: () => void) => {
      setContent(drawerContent);
      setIsVisible(true);
      setIsExpanded(expanded);
      setOnCloseCallback(onClose || null);
    },
    []
  );

  const closeDrawer = useCallback(() => {
    setIsVisible(false);
    // Call the onClose callback after a small delay to ensure drawer closes first
    setTimeout(() => {
      setOnCloseCallback((callback) => {
        if (typeof callback === 'function') {
          callback();
        }
        return null;
      });
    }, 300);
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
