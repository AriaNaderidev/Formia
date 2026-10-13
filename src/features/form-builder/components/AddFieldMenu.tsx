import { createFieldFromType, FIELD_CATALOG } from "../../form-schema";
import { useFormBuilderContext } from "../context/useFormBuilderContext";

type AddFieldMenuProps = {
  afterId: string;
  onClose: () => void;
};

export const AddFieldMenu = ({ afterId, onClose }: AddFieldMenuProps) => {
  const { setFields } = useFormBuilderContext();

  const handleAdd = (type: (typeof FIELD_CATALOG)[number]["type"]) => {
    const nextField = createFieldFromType(type);
    setFields((prev) => {
      const index = prev.findIndex((field) => field.id === afterId);
      if (index === -1) return [...prev, nextField];
      const copy = [...prev];
      copy.splice(index + 1, 0, nextField);
      return copy;
    });
    onClose();
  };

  return (
    <div className="absolute top-11 -right-18 z-9999 max-h-[200px] w-[150px] overflow-y-auto rounded-md border border-(--primary-border-color) bg-(--primary-bg-color) p-1">
      <span className="h-[20%] w-full space-y-1 text-center">
        <h1 className="font-sans text-[1.1rem] font-medium">Components</h1>
        <hr className="w-full text-(--primary-border-color)" />
      </span>
      <div className="space-y-2 p-1 font-sans">
        {FIELD_CATALOG.map((field) => (
          <button
            type="button"
            onClick={() => handleAdd(field.type)}
            className="w-full cursor-pointer rounded p-1 text-left duration-300 hover:bg-stone-200"
            key={field.id}
          >
            {field.type}
          </button>
        ))}
      </div>
    </div>
  );
};
