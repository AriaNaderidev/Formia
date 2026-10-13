import { useState } from "react";
import {
  INPUT_FIELD_TYPES,
  OPTION_FIELD_TYPES,
  type FormField,
} from "../../form-schema";
import { useEditField } from "../hooks/useEditField";
import { Button } from "@mui/material";

type FieldEditFormProps = {
  source: FormField;
  onClose: () => void;
};

export const FieldEditForm = ({ source, onClose }: FieldEditFormProps) => {
  const { register, handleSubmit, onSubmit, watch, setValue, getValues } =
    useEditField(source, onClose);

  const type = watch("type");
  const validation = watch("validation");
  const options = watch("options") ?? [];
  const [optionCount, setOptionCount] = useState(
    Math.max(options.length, source.options?.length ?? 0),
  );

  const showLengthRules =
    type === "text" ||
    type === "password" ||
    type === "textarea" ||
    type === "email" ||
    type === "tel";

  const showPattern =
    type === "text" ||
    type === "email" ||
    type === "tel" ||
    type === "textarea";

  return (
    <form
      className="flex h-full max-h-[80vh] w-full flex-col gap-4 overflow-y-auto rounded-md bg-(--primary-bg-color) p-5 text-black"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl font-medium">Edit {type} field</h2>

      <label className="flex flex-col gap-1 p-2 text-sm">
        Label
        <input
          className="rounded p-1.5 shadow"
          type="text"
          {...register("label")}
        />
      </label>

      <label className="flex flex-col gap-1 p-2 text-sm">
        Name
        <input
          className="rounded p-1.5 shadow"
          type="text"
          {...register("name")}
        />
      </label>

      <label className="flex flex-col gap-1 p-2 text-sm">
        Classname
        <input
          className="rounded p-1.5 shadow"
          type="text"
          {...register("className")}
        />
      </label>

      {INPUT_FIELD_TYPES.includes(type) ? (
        <label className="flex flex-col gap-1 p-2 text-sm">
          Type
          <select className="rounded p-1.5 shadow" {...register("type")}>
            {INPUT_FIELD_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex items-center gap-2 p-1">
        <label className="text-sm">Required</label>
        <input type="checkbox" {...register("validation.required")} />
        {validation?.required ? (
          <input
            placeholder="Required message"
            className="rounded p-1.5 text-sm shadow placeholder:text-gray-400"
            type="text"
            {...register("validation.requiredMessage")}
          />
        ) : null}
      </div>

      {showLengthRules ? (
        <>
          <div className="flex items-center gap-2 p-1">
            <label className="text-sm">Min Length</label>
            <input type="checkbox" {...register("validation.useMinLength")} />
            {validation?.useMinLength ? (
              <>
                <input
                  placeholder="Min length"
                  className="rounded p-1.5 text-sm shadow"
                  type="number"
                  {...register("validation.minLength", { valueAsNumber: true })}
                />
                <input
                  placeholder="Min length message"
                  className="rounded p-1.5 text-sm shadow"
                  type="text"
                  {...register("validation.minLengthMessage")}
                />
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-2 p-1">
            <label className="text-sm">Max Length</label>
            <input type="checkbox" {...register("validation.useMaxLength")} />
            {validation?.useMaxLength ? (
              <>
                <input
                  placeholder="Max length"
                  className="rounded p-1.5 text-sm shadow"
                  type="number"
                  {...register("validation.maxLength", { valueAsNumber: true })}
                />
                <input
                  placeholder="Max length message"
                  className="rounded p-1.5 text-sm shadow"
                  type="text"
                  {...register("validation.maxLengthMessage")}
                />
              </>
            ) : null}
          </div>
        </>
      ) : null}

      {type === "number" ? (
        <>
          <div className="flex items-center gap-2 p-1">
            <label className="text-sm">Minimum</label>
            <input type="checkbox" {...register("validation.useMin")} />
            {validation?.useMin ? (
              <>
                <input
                  placeholder="Min value"
                  className="rounded p-1.5 text-sm shadow"
                  type="number"
                  {...register("validation.min", { valueAsNumber: true })}
                />
                <input
                  placeholder="Min value message"
                  className="rounded p-1.5 text-sm shadow"
                  type="text"
                  {...register("validation.minMessage")}
                />
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-2 p-1">
            <label className="text-sm">Maximum</label>
            <input type="checkbox" {...register("validation.useMax")} />
            {validation?.useMax ? (
              <>
                <input
                  placeholder="Max value"
                  className="rounded p-1.5 text-sm shadow"
                  type="number"
                  {...register("validation.max", { valueAsNumber: true })}
                />
                <input
                  placeholder="Max value message"
                  className="rounded p-1.5 text-sm shadow"
                  type="text"
                  {...register("validation.maxMessage")}
                />
              </>
            ) : null}
          </div>
        </>
      ) : null}

      {showPattern ? (
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col text-sm">
            Custom pattern
            <input
              placeholder="Regex"
              className="rounded p-1.5 text-sm shadow"
              type="text"
              {...register("validation.pattern")}
            />
          </label>
          <label className="flex flex-col text-sm">
            Invalid message
            <input
              placeholder="Message"
              className="rounded p-1.5 text-sm shadow"
              type="text"
              {...register("validation.patternMessage")}
            />
          </label>
        </div>
      ) : null}

      <div className="flex w-[90px] gap-2 p-1">
        <label className="text-sm">Disabled</label>
        <input type="checkbox" {...register("disabled")} />
      </div>

      {OPTION_FIELD_TYPES.includes(type) ? (
        <div className="flex flex-col gap-2 p-2">
          <span className="text-sm">Options</span>
          {Array.from({ length: optionCount }).map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <input
                className="rounded p-1 shadow"
                placeholder="Label"
                type="text"
                {...register(`options.${index}.label`)}
              />
              <input
                className="rounded p-1 shadow"
                placeholder="Value"
                type="text"
                {...register(`options.${index}.value`)}
              />
            </div>
          ))}
          <button
            type="button"
            className="w-fit cursor-pointer rounded bg-stone-100 px-2 py-1 text-sm"
            onClick={() => {
              const current = getValues("options") ?? [];
              setValue("options", [...current, { label: "", value: "" }]);
              setOptionCount((count) => count + 1);
            }}
          >
            Add option
          </button>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" variant="contained" className="w-full">
          Update
        </Button>
        <Button type="reset" variant="outlined" className="w-full">
          Clear
        </Button>
      </div>
    </form>
  );
};
