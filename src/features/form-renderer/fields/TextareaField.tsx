import type { UseFormRegisterReturn } from "react-hook-form";
import type { FormField } from "../../form-schema";
import { fieldClass, labelClass } from "./fieldStyles";

type Props = {
  field: FormField;
  hasError: boolean;
  registerProps: UseFormRegisterReturn;
};

export const TextareaField = ({ field, hasError, registerProps }: Props) => (
  <label className="flex flex-col gap-1" htmlFor={field.id}>
    <span className={labelClass(hasError)}>{field.label}</span>
    <textarea
      id={field.id}
      rows={field.rowNumber ?? 3}
      disabled={field.disabled}
      className={fieldClass(hasError, field.className)}
      {...registerProps}
    />
  </label>
);
