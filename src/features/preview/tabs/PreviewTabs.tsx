import { createElement, type ReactNode } from "react";
import { TabsContext, type TabsContextType } from "./previewTabsContext";
import { usePreviewTabs } from "./usePreviewTabs";

type PreviewTabsProps = {
  value: TabsContextType;
  children: ReactNode;
};

export const PreviewTabs = ({ value, children }: PreviewTabsProps) =>
  createElement(TabsContext.Provider, { value }, children);

type TabProps = {
  id: string;
  children: ReactNode;
};

export const Tab = ({ id, children }: TabProps) => {
  const { active, setActive } = usePreviewTabs();

  return (
    <button
      type="button"
      onClick={() => setActive(id)}
      className={`w-[50%] cursor-pointer rounded-sm p-1 text-center ${
        active === id
          ? "bg-(--primary-bg-color) text-black shadow-[0px_0px_3px_gray]"
          : ""
      }`}
    >
      {children}
    </button>
  );
};
