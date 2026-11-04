import { useContext } from "react";
import {
  FormActionsContext,
  FormDirectionContext,
  FormFieldsContext,
} from "./formBuilderContext";

const MISSING = "must be used within a FormBuilderProvider";

/** setFields / getFields only. Stable: never causes a re-render. */
export const useFormBuilderActions = () => {
  const actions = useContext(FormActionsContext);
  if (!actions) throw new Error(`useFormBuilderActions ${MISSING}`);
  return actions;
};

/** The form's reading direction. Does not re-render on field changes. */
export const useFormDirection = () => {
  const direction = useContext(FormDirectionContext);
  if (!direction) throw new Error(`useFormDirection ${MISSING}`);
  return direction;
};

/** Fields and actions. Re-renders on every field change. */
export const useFormBuilderContext = () => {
  const fields = useContext(FormFieldsContext);
  const actions = useFormBuilderActions();
  if (!fields) throw new Error(`useFormBuilderContext ${MISSING}`);
  return { fields, ...actions };
};
