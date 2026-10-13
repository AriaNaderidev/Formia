import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import type { FormField } from "../../form-schema";
import { fieldClass, labelClass } from "./fieldStyles";

type Props = {
  field: FormField;
  hasError: boolean;
  registerProps: UseFormRegisterReturn;
};

export const PasswordField = ({ field, hasError, registerProps }: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1" htmlFor={field.id}>
      <span className={labelClass(hasError)}>{field.label}</span>
      <span className="relative">
        <input
          id={field.id}
          type={visible ? "text" : "password"}
          disabled={field.disabled}
          className={fieldClass(hasError, `pr-10 ${field.className ?? ""}`)}
          {...registerProps}
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-lg text-stone-500"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <MdVisibilityOff /> : <MdVisibility />}
        </button>
      </span>
    </label>
  );
};
