import { useDroppable } from "@dnd-kit/core";
import EmptyState from "../../../../public/images/EmptyState.jpg";

export const DropEmptyState = () => {
  const { setNodeRef } = useDroppable({
    id: "main-area",
  });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full w-full items-center justify-center rounded-md"
    >
      <img
        src={EmptyState}
        alt="empty_state"
        className="rounded-md object-center duration-300 hover:translate-y-3 hover:rotate-1"
      />
    </div>
  );
};
