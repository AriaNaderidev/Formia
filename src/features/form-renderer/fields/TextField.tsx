import type { UseFormRegisterReturn } from "react-hook-form";
import type { FormField } from "../../form-schema";
import { fieldClass, labelClass } from "./fieldStyles";

type Props = {
  field: FormField;
  hasError: boolean;
  registerProps: UseFormRegisterReturn;
};

export const TextField = ({ field, hasError, registerProps }: Props) => {
  const inputType = field.type === "textarea" ? "text" : field.type;

  return (
    <label className="flex flex-col gap-1" htmlFor={field.id}>
      <span className={labelClass(hasError)}>{field.label}</span>
      <input
        id={field.id}
        type={inputType}
        disabled={field.disabled}
        className={fieldClass(hasError, field.className)}
        {...registerProps}
      />
    </label>
  );
};
