import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import Button from "@mui/material/Button";
import {
  buildZodSchema,
  getDefaultValues,
  groupIntoRows,
  toFieldSpecs,
  type FieldSpec,
  type FormField,
} from "../form-schema";
import { FieldControl, type FormValues } from "./FieldControl";
import { LayoutElement } from "./LayoutElement";

export type SubmittedForm = {
  data: Record<string, unknown>;
  specs: FieldSpec[];
};

type FormRendererProps = {
  fields: FormField[];
  onSubmit?: (result: SubmittedForm) => void;
  /** Called with the number of invalid fields when a submit is blocked. */
  onInvalid?: (count: number) => void;
};

/** Gives the preview a realistic "sending" moment so loading states can be seen. */
const SIMULATED_LATENCY_MS = 600;

/**
 * Values survive edits to labels, rules, options and layout. The form only starts
 * fresh when the shape of its data changes: a field added, removed, renamed,
 * retyped, or given a new default.
 */
const dataShapeKey = (specs: FieldSpec[], defaults: FormValues) =>
  JSON.stringify(specs.map((spec) => [spec.name, spec.kind, defaults[spec.name]]));

export const FormRenderer = (props: FormRendererProps) => {
  const specs = useMemo(() => toFieldSpecs(props.fields), [props.fields]);
  const defaults = useMemo(() => getDefaultValues(specs), [specs]);

  return (
    <LiveForm
      key={dataShapeKey(specs, defaults)}
      {...props}
      specs={specs}
      defaults={defaults}
    />
  );
};

type LiveFormProps = FormRendererProps & {
  specs: FieldSpec[];
  defaults: FormValues;
};

const LiveForm = ({
  fields,
  specs,
  defaults,
  onSubmit,
  onInvalid,
}: LiveFormProps) => {
  const schema = useMemo(() => buildZodSchema(specs), [specs]);

  // The resolver reads the latest schema, so rule edits apply without a remount.
  const schemaRef = useRef(schema);
  useLayoutEffect(() => {
    schemaRef.current = schema;
  }, [schema]);
  const resolver = useCallback<Resolver<FormValues>>(
    (values, context, options) =>
      (zodResolver(schemaRef.current) as unknown as Resolver<FormValues>)(
        values,
        context,
        options,
      ),
    [],
  );

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { isSubmitting, isSubmitted },
  } = useForm<FormValues>({
    defaultValues: defaults,
    resolver,
    mode: "onTouched",
  });

  // After a submit attempt, show the effect of edited rules right away.
  useEffect(() => {
    if (isSubmitted) void trigger();
  }, [schema, isSubmitted, trigger]);

  const formRef = useRef<HTMLFormElement>(null);
  const onReset = useCallback(() => reset(defaults), [reset, defaults]);

  const submit = handleSubmit(
    async (data) => {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
      onSubmit?.({ data, specs });
    },
    (errors) => {
      // Restart the CSS animation in place. Remounting would steal focus from the first error.
      const form = formRef.current;
      if (form) {
        form.classList.remove("animate-shake");
        void form.offsetWidth;
        form.classList.add("animate-shake");
      }
      onInvalid?.(Object.keys(errors).length);
    },
  );

  const rows = useMemo(() => groupIntoRows(fields), [fields]);
  const specById = useMemo(
    () => new Map(specs.map((spec) => [spec.field.id, spec])),
    [specs],
  );
  const hasSubmitButton = fields.some(
    (field) => field.type === "button" && (field.buttonType ?? "submit") === "submit",
  );

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      onReset={(event) => {
        event.preventDefault();
        onReset();
      }}
      className="@container flex flex-col gap-4"
    >
      {rows.map((row, index) => (
        <div
          key={row.key}
          style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
          className={`animate-fade-up grid gap-4 ${
            row.fields.length > 1 ? "@sm:grid-cols-2" : ""
          }`}
        >
          {row.fields.map((field) => {
            const spec = specById.get(field.id);
            return (
              <div key={field.id} className="min-w-0">
                {spec ? (
                  <FieldControl spec={spec} control={control} />
                ) : (
                  <LayoutElement
                    field={field}
                    isSubmitting={isSubmitting}
                    onReset={onReset}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {hasSubmitButton ? null : (
        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ flex: 1 }}
          >
            Submit
          </Button>
          <Button type="reset" variant="text" color="inherit">
            Reset
          </Button>
        </div>
      )}
    </form>
  );
};
