import { useMemo, type ReactNode } from "react";
import {
  FormActionsContext,
  FormFieldsContext,
  type FormBuilderContextType,
} from "./formBuilderContext";

type ProviderProps = {
  children: ReactNode;
  value: FormBuilderContextType;
};

export const FormBuilderProvider = ({ children, value }: ProviderProps) => {
  const { fields, setFields, getFields } = value;
  const actions = useMemo(() => ({ setFields, getFields }), [setFields, getFields]);

  return (
    <FormActionsContext.Provider value={actions}>
      <FormFieldsContext.Provider value={fields}>{children}</FormFieldsContext.Provider>
    </FormActionsContext.Provider>
  );
};
