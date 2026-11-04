import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import Button from "@mui/material/Button";
import {
  BUTTON_VARIANT_BY_TYPE,
  buildZodSchema,
  getDefaultValues,
  buildLayout,
  toFieldSpecs,
  type FieldSpec,
  type FormDirection,
  type FormField,
} from "../form-schema";
import { DirectionScope } from "./DirectionScope";
import { FieldControl, type FormValues } from "./FieldControl";
import { FormLayout } from "./FormLayout";
import { LayoutElement } from "./LayoutElement";

export type SubmittedForm = {
  data: Record<string, unknown>;
  specs: FieldSpec[];
};

type FormRendererProps = {
  fields: FormField[];
  direction?: FormDirection;
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
  direction = "ltr",
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
    setFocus,
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

  const specById = useMemo(
    () => new Map(specs.map((spec) => [spec.field.id, spec])),
    [specs],
  );
  const layout = useMemo(() => buildLayout(fields), [fields]);
  const tabs = layout.tabs;
  const tabbed = tabs.length > 0;
  const [requestedTab, setActiveTab] = useState(0);
  // Deleting tabs in the builder can leave the saved index past the end.
  const activeTab = Math.max(0, Math.min(requestedTab, tabs.length - 1));

  const namesOf = useCallback(
    (index: number) =>
      (tabs[index]?.fields ?? []).flatMap((field) => {
        const spec = specById.get(field.id);
        return spec ? [spec.name] : [];
      }),
    [tabs, specById],
  );

  /** "Next": only moves on when the current tab is valid. */
  const goNext = async () => {
    const names = namesOf(activeTab);
    if (names.length === 0 || (await trigger(names, { shouldFocus: true }))) {
      setActiveTab(activeTab + 1);
    }
  };

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

      // The first error may be on a tab that is hidden: show that tab, then focus the field.
      const firstTab = tabs.findIndex((_, index) => namesOf(index).some((name) => name in errors));
      const firstName = namesOf(firstTab).find((name) => name in errors);
      if (tabbed && firstTab !== -1 && firstName) {
        setActiveTab(firstTab);
        requestAnimationFrame(() => setFocus(firstName));
      }
    },
  );

  const hasSubmitButton = fields.some(
    (field) => field.type === "button" && (field.buttonType ?? "submit") === "submit",
  );

  return (
    <DirectionScope direction={direction}>
    <form
      ref={formRef}
      dir={direction}
      noValidate
      onSubmit={submit}
      onReset={(event) => {
        event.preventDefault();
        onReset();
      }}
      className="@container flex flex-col gap-4"
    >
      <FormLayout
        layout={layout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNext={goNext}
        renderField={(field) => {
          const spec = specById.get(field.id);
          return spec ? (
            <FieldControl spec={spec} control={control} />
          ) : (
            <LayoutElement field={field} isSubmitting={isSubmitting} onReset={onReset} />
          );
        }}
        footer={
          hasSubmitButton ? null : (
            <div className="grid grid-cols-[2fr_1fr] gap-2 pt-1">
              <Button
                fullWidth
                type="submit"
                variant={BUTTON_VARIANT_BY_TYPE.submit}
                loading={isSubmitting}
              >
                Submit
              </Button>
              <Button fullWidth type="reset" variant={BUTTON_VARIANT_BY_TYPE.reset}>
                Reset
              </Button>
            </div>
          )
        }
      />
    </form>
    </DirectionScope>
  );
};
