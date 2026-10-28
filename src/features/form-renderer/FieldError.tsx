import { useRef } from "react";

type FieldErrorProps = {
  id: string;
  message?: string;
};

/**
 * Error text that slides open and closed instead of making the form jump.
 * The last message is kept while it collapses, so the text doesn't vanish mid-animation.
 */
export const FieldError = ({ id, message }: FieldErrorProps) => {
  const lastMessage = useRef(message);
  if (message) lastMessage.current = message;
  const isOpen = Boolean(message);

  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <p
        id={id}
        role={isOpen ? "alert" : undefined}
        className="min-h-0 overflow-hidden text-xs font-medium text-red-600"
      >
        <span
          className={`block pt-1 transition-transform duration-200 ${
            isOpen ? "translate-y-0" : "-translate-y-1"
          }`}
        >
          {lastMessage.current}
        </span>
      </p>
    </div>
  );
};
