import { useCallback, useEffect } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import type { FormField } from "@/features/form-schema";
import { useFormBuilderContext } from "../context/useFormBuilderContext";
import { cleanEditorValues, toEditorValues, type EditorValues } from "../components/FieldEditor/editor_model";

type UseFieldEditorOptions = {
  open: boolean;
  onClose: () => void;
  onInvalid: (errors: FieldErrors<EditorValues>) => void;
};

export const useFieldEditor = (
  source: FormField,
  { open, onClose, onInvalid }: UseFieldEditorOptions,
) => {
  const { setFields } = useFormBuilderContext();
  const methods = useForm<EditorValues>({
    defaultValues: toEditorValues(source),
  });
  const { reset, handleSubmit } = methods;

  const resetToSource = useCallback(
    () => reset(toEditorValues(source)),
    [reset, source],
  );

  // Start from the latest saved field every time the dialog opens.
  useEffect(() => {
    if (open) reset(toEditorValues(source));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = handleSubmit((values) => {
    const next = cleanEditorValues(values);
    // `next` has no id / rowId / children, so the canvas keeps its own.
    setFields((prev) =>
      prev.map((field) =>
        field.id === source.id ? { ...field, ...next } : field,
      ),
    );
    onClose();
  }, onInvalid);

  return { methods, submit, resetToSource };
};
