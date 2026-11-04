import type { MouseEvent } from "react";

type SkipLinksProps = {
  onFields: () => void;
  onCanvas: () => void;
  onPreview: () => void;
};

const LINK_CLASS =
  "bg-plum focus-visible:outline-plum rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * The first things Tab reaches: they stay hidden until focused. They go through
 * the same focus code as the Alt+number shortcuts, so a closed drawer or a hidden
 * pane is opened first.
 */
export const SkipLinks = ({ onFields, onCanvas, onPreview }: SkipLinksProps) => {
  const jump = (go: () => void) => (event: MouseEvent) => {
    event.preventDefault();
    go();
  };

  return (
    <nav
      aria-label="Skip links"
      className="fixed start-3 top-3 z-1600 flex -translate-y-20 gap-2 focus-within:translate-y-0 motion-safe:transition-transform"
    >
      <a href="#main-content" onClick={jump(onCanvas)} className={LINK_CLASS}>
        Skip to the form canvas
      </a>
      <a href="#palette-search" onClick={jump(onFields)} className={LINK_CLASS}>
        Skip to the field list
      </a>
      <a href="#preview-panel" onClick={jump(onPreview)} className={LINK_CLASS}>
        Skip to the preview
      </a>
    </nav>
  );
};
