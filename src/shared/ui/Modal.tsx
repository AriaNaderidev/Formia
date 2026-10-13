import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClose}
    >
      <div
        className="relative w-[600px] max-w-[80%] rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-1 right-2 cursor-pointer text-2xl text-gray-400 duration-200 hover:text-black"
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};
