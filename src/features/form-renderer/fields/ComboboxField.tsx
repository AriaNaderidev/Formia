import type { UseFormRegisterReturn } from "react-hook-form";
import type { FormField } from "../../form-schema";
import { fieldClass, labelClass } from "./fieldStyles";

type Props = {
  field: FormField;
  hasError: boolean;
  registerProps: UseFormRegisterReturn;
};

export const ComboboxField = ({ field, hasError, registerProps }: Props) => {
  const listId = `${field.id}-options`;

  return (
    <label className="flex flex-col gap-1" htmlFor={field.id}>
      <span className={labelClass(hasError)}>{field.label}</span>
      <input
        id={field.id}
        list={listId}
        disabled={field.disabled}
        className={fieldClass(hasError, field.className)}
        {...registerProps}
      />
      <datalist id={listId}>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </datalist>
    </label>
  );
};
