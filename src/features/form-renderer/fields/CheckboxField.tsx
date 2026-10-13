import type { UseFormRegisterReturn } from "react-hook-form";
import type { FormField } from "../../form-schema";
import { labelClass } from "./fieldStyles";

type Props = {
  field: FormField;
  hasError: boolean;
  registerProps: UseFormRegisterReturn;
};

export const CheckboxField = ({ field, hasError, registerProps }: Props) => (
  <label className="flex items-center gap-2" htmlFor={field.id}>
    <input
      id={field.id}
      type="checkbox"
      disabled={field.disabled}
      className={`h-4 w-4 ${field.className ?? ""}`}
      {...registerProps}
    />
    <span className={labelClass(hasError)}>{field.label}</span>
  </label>
);
