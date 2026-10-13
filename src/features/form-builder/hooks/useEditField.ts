import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { FieldType, FormField } from "../../form-schema";
import { useFormBuilderContext } from "../context/useFormBuilderContext";

export type FieldEditValues = {
  name: string;
  label: string;
  className: string;
  type: FieldType;
  disabled: boolean;
  defaultValue: string | boolean | number;
  options: { label: string; value: string }[];
  validation: FormField["validation"];
};

export const useEditField = (source: FormField, onClose: () => void) => {
  const { setFields } = useFormBuilderContext();

  const { register, handleSubmit, reset, watch, setValue, getValues } =
    useForm<FieldEditValues>({
      defaultValues: {
        name: source.name,
        label: source.label,
        className: source.className ?? "",
        type: source.type,
        disabled: source.disabled ?? false,
        defaultValue: source.defaultValue ?? "",
        options: source.options ?? [],
        validation: source.validation ?? {},
      },
    });

  useEffect(() => {
    reset({
      name: source.name,
      label: source.label,
      className: source.className ?? "",
      type: source.type,
      disabled: source.disabled ?? false,
      defaultValue: source.defaultValue ?? "",
      options: source.options ?? [],
      validation: source.validation ?? {},
    });
  }, [source, reset]);

  const onSubmit: SubmitHandler<FieldEditValues> = (data) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === source.id
          ? {
              ...field,
              ...data,
              options: data.options?.filter(
                (option) => option.label || option.value,
              ),
            }
          : field,
      ),
    );
    onClose();
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    watch,
    setValue,
    getValues,
  };
};
