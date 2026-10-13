import type { UseFormRegisterReturn } from "react-hook-form";
import type { FormField } from "../../form-schema";
import { fieldClass, labelClass } from "./fieldStyles";

type Props = {
  field: FormField;
  hasError: boolean;
  registerProps: UseFormRegisterReturn;
};

export const SelectField = ({ field, hasError, registerProps }: Props) => (
  <label className="flex flex-col gap-1" htmlFor={field.id}>
    <span className={labelClass(hasError)}>{field.label}</span>
    <select
      id={field.id}
      disabled={field.disabled}
      className={fieldClass(hasError, field.className)}
      {...registerProps}
    >
      <option value="">None</option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
