import type { UseFormRegisterReturn } from "react-hook-form";
import type { FormField } from "../../form-schema";
import { labelClass } from "./fieldStyles";

type Props = {
  field: FormField;
  hasError: boolean;
  registerProps: UseFormRegisterReturn;
};

export const RadioGroupField = ({ field, hasError, registerProps }: Props) => (
  <fieldset className="flex flex-col gap-2">
    <legend className={labelClass(hasError)}>{field.label}</legend>
    {field.options?.map((option) => (
      <label key={option.value} className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          value={option.value}
          disabled={field.disabled}
          className={field.className}
          {...registerProps}
        />
        {option.label}
      </label>
    ))}
  </fieldset>
);
