import { useContext } from "react";
import { TabsContext } from "./previewTabsContext";

export const usePreviewTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("usePreviewTabs must be used within PreviewTabs");
  }
  return context;
};
