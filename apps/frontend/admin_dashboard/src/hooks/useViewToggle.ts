import { useContext } from "react";
import { ViewToggleContext } from "../contexts/ViewToggleContext";

export const useViewToggle = () => {
  const context = useContext(ViewToggleContext);
  if (context === undefined) {
    throw new Error("useViewToggle must be used within a ViewToggleProvider");
  }
  return context;
};
