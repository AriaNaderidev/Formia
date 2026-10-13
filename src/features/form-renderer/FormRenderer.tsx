import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type SubmitHandler,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { buildZodSchema, type FormSchema } from "../form-schema";
import { CheckboxField } from "./fields/CheckboxField";
import { ComboboxField } from "./fields/ComboboxField";
import { PasswordField } from "./fields/PasswordField";
import { RadioGroupField } from "./fields/RadioGroupField";
import { SelectField } from "./fields/SelectField";
import { TextareaField } from "./fields/TextareaField";
import { TextField } from "./fields/TextField";
import { Button } from "@mui/material";

type FormRendererProps = {
  schema: FormSchema;
  onSubmit?: (data: Record<string, unknown>) => void;
  submitText?: string;
  resetText?: string;
};

const getDefaultValues = (schema: FormSchema) =>
  schema.fields.reduce<Record<string, unknown>>((acc, field) => {
    switch (field.type) {
      case "checkbox":
        acc[field.id] = Boolean(field.defaultValue);
        break;
      case "file":
        acc[field.id] = undefined;
        break;
      default:
        acc[field.id] = field.defaultValue ?? "";
    }
    return acc;
  }, {});

export const FormRenderer = ({
  schema,
  onSubmit,
  submitText = "Submit",
  resetText = "Clear",
}: FormRendererProps) => {
  const zodSchema = buildZodSchema(schema.fields);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    defaultValues: getDefaultValues(schema),
    resolver: zodResolver(zodSchema),
    mode: "onChange",
  });

  const handleFormSubmit: SubmitHandler<Record<string, unknown>> = (data) => {
    onSubmit?.(data);
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      {schema.fields.map((field) => {
        const hasError = Boolean(errors[field.id]);
        const registerProps = register(field.id) as UseFormRegisterReturn;

        return (
          <div key={field.id} className="flex flex-col gap-1">
            {field.type === "password" ? (
              <PasswordField
                field={field}
                hasError={hasError}
                registerProps={registerProps}
              />
            ) : field.type === "textarea" ? (
              <TextareaField
                field={field}
                hasError={hasError}
                registerProps={registerProps}
              />
            ) : field.type === "checkbox" ? (
              <CheckboxField
                field={field}
                hasError={hasError}
                registerProps={registerProps}
              />
            ) : field.type === "select" ? (
              <SelectField
                field={field}
                hasError={hasError}
                registerProps={registerProps}
              />
            ) : field.type === "radiogroup" ? (
              <RadioGroupField
                field={field}
                hasError={hasError}
                registerProps={registerProps}
              />
            ) : field.type === "combobox" ? (
              <ComboboxField
                field={field}
                hasError={hasError}
                registerProps={registerProps}
              />
            ) : (
              <TextField
                field={field}
                hasError={hasError}
                registerProps={registerProps}
              />
            )}
            {hasError ? (
              <p className="w-max rounded bg-red-100 p-1 text-sm text-red-400">
                {String(errors[field.id]?.message ?? "")}
              </p>
            ) : null}
          </div>
        );
      })}

      <div className="flex gap-2">
        <Button variant="contained" type="submit" className="w-full">
          {submitText}
        </Button>
        <Button variant="outlined" type="reset" className="w-full">
          {resetText}
        </Button>
      </div>
    </form>
  );
};
