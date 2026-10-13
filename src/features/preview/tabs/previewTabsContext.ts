import { createContext, type Dispatch, type SetStateAction } from "react";

export type TabsContextType = {
  active: string;
  setActive: Dispatch<SetStateAction<string>>;
};

export const TabsContext = createContext<TabsContextType | undefined>(
  undefined,
);
