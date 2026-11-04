import { createContext, type Dispatch, type SetStateAction } from "react";
import type { FormDirection, FormField } from "../../form-schema";

export type FormBuilderActions = {
  setFields: Dispatch<SetStateAction<FormField[]>>;
  /** Latest fields without subscribing to them (for event handlers in memoized parts). */
  getFields: () => FormField[];
  setDirection: (direction: FormDirection) => void;
  getDirection: () => FormDirection;
};

export type FormBuilderContextType = FormBuilderActions & {
  fields: FormField[];
  direction: FormDirection;
};

/**
 * Split in parts: the actions never change, so components that only write
 * (field cards, palette tiles, editors) don't re-render whenever a field changes.
 * Direction has its own context so the canvas rows don't re-render when it flips.
 */
export const FormFieldsContext = createContext<FormField[] | undefined>(undefined);
export const FormDirectionContext = createContext<FormDirection | undefined>(undefined);
export const FormActionsContext = createContext<FormBuilderActions | undefined>(
  undefined,
);
