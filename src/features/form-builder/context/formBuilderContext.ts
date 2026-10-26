import { createContext, type Dispatch, type SetStateAction } from "react";
import type { FormField } from "../../form-schema";

export type FormBuilderActions = {
  setFields: Dispatch<SetStateAction<FormField[]>>;
  /** Latest fields without subscribing to them (for event handlers in memoized parts). */
  getFields: () => FormField[];
};

export type FormBuilderContextType = FormBuilderActions & {
  fields: FormField[];
};

/**
 * Split in two: the actions never change, so components that only write
 * (field cards, palette tiles, editors) don't re-render whenever a field changes.
 */
export const FormFieldsContext = createContext<FormField[] | undefined>(undefined);
export const FormActionsContext = createContext<FormBuilderActions | undefined>(
  undefined,
);
