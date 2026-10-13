import { useDraggable } from "@dnd-kit/core";

type PaletteItemProps = {
  id: string;
  name: string;
};

export const PaletteItem = ({ id, name }: PaletteItemProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  return (
    <div
      {...listeners}
      {...attributes}
      ref={setNodeRef}
      className="w-[130px] cursor-grab rounded-xl p-2 py-3 text-center text-sm font-medium text-white shadow-[0px_0px_2px_white] duration-250 hover:rounded hover:border hover:border-white"
    >
      <p>{name}</p>
    </div>
  );
};
