import { useMemo, type ReactNode } from "react";
import {
  FormActionsContext,
  FormDirectionContext,
  FormFieldsContext,
  type FormBuilderContextType,
} from "./formBuilderContext";

type ProviderProps = {
  children: ReactNode;
  value: FormBuilderContextType;
};

export const FormBuilderProvider = ({ children, value }: ProviderProps) => {
  const { fields, direction, setFields, getFields, setDirection, getDirection } = value;
  const actions = useMemo(
    () => ({ setFields, getFields, setDirection, getDirection }),
    [setFields, getFields, setDirection, getDirection],
  );

  return (
    <FormActionsContext.Provider value={actions}>
      <FormDirectionContext.Provider value={direction}>
        <FormFieldsContext.Provider value={fields}>{children}</FormFieldsContext.Provider>
      </FormDirectionContext.Provider>
    </FormActionsContext.Provider>
  );
};
