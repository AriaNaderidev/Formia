import { createContext, type Dispatch, type SetStateAction } from "react";
import type { FormField } from "../../form-schema";

export type FormBuilderContextType = {
  fields: FormField[];
  setFields: Dispatch<SetStateAction<FormField[]>>;
  formData: Record<string, unknown>;
  setFormData: Dispatch<SetStateAction<Record<string, unknown>>>;
};

export const FormBuilderContext = createContext<
  FormBuilderContextType | undefined
>(undefined);
