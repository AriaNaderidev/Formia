import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MdDragIndicator,
  MdOutlineDelete,
  MdOutlineModeEdit,
} from "react-icons/md";
import { HiOutlinePlus } from "react-icons/hi2";
import type { FormField } from "../../form-schema";
import { Modal } from "../../../shared/ui/Modal";
import { useFormBuilderContext } from "../context/useFormBuilderContext";
import { AddFieldMenu } from "./AddFieldMenu";
import { FieldEditForm } from "./FieldEditForm";

type CanvasFieldProps = {
  field: FormField;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
};

export const CanvasField = ({
  field,
  openMenuId,
  setOpenMenuId,
}: CanvasFieldProps) => {
  const { setFields } = useFormBuilderContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isMenuOpen = openMenuId === field.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const plusButton = document.getElementById(`plus-${field.id}`);
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        plusButton &&
        !plusButton.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };

    if (isMenuOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuOpen, field.id, setOpenMenuId]);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 9999 : "auto",
      }}
      className="relative flex w-full items-center justify-between gap-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex w-full cursor-grab items-center justify-between rounded-md border border-(--primary-border-color) bg-(--primary-bg-color) p-2 font-medium text-black duration-100 active:border-sky-200"
      >
        <div className="flex items-center gap-1">
          <span className="text-xl">
            <MdDragIndicator />
          </span>
          <span>{field.type}</span>
        </div>

        <div
          className="flex cursor-pointer items-center text-xl"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="rounded p-1 duration-300 hover:bg-stone-200"
            onClick={() => setIsEditOpen(true)}
          >
            <MdOutlineModeEdit />
          </button>
          <button
            type="button"
            className="rounded p-1 duration-300 hover:bg-stone-200"
            onClick={() =>
              setFields((prev) => prev.filter((item) => item.id !== field.id))
            }
          >
            <MdOutlineDelete />
          </button>
        </div>
      </div>

      <div onPointerDown={(event) => event.stopPropagation()}>
        <button
          type="button"
          id={`plus-${field.id}`}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full p-1 shadow-[0px_0px_3px_gray] duration-300 hover:bg-stone-100"
          onClick={() => setOpenMenuId(isMenuOpen ? null : field.id)}
        >
          <HiOutlinePlus />
        </button>
        {isMenuOpen ? (
          <div ref={menuRef}>
            <AddFieldMenu
              afterId={field.id}
              onClose={() => setOpenMenuId(null)}
            />
          </div>
        ) : null}
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <FieldEditForm
          source={field}
          onClose={() => setIsEditOpen(false)}
        />
      </Modal>
    </div>
  );
};
