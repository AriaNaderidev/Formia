import { Fragment } from "react";
import { getKeyLabel, type KeyCombo } from "./shortcutList";

/** One way of pressing a shortcut: key caps joined by "+". */
const Combo = ({ keys, sequence }: { keys: KeyCombo; sequence?: boolean }) => (
  <span className="inline-flex items-center gap-1">
    {keys.map((token, index) => {
      const { text, name } = getKeyLabel(token);
      return (
        <Fragment key={index}>
          {index > 0 &&
            (sequence ? (
              <span className="text-ink-muted text-xs">then</span>
            ) : (
              <span className="sr-only">plus</span>
            ))}
          <kbd
            aria-label={name}
            className="border-line text-ink inline-grid min-w-6 place-items-center rounded-md border bg-white px-1.5 py-0.5 font-sans text-xs font-medium shadow-[0_1px_0_var(--color-line)]"
          >
            {text}
          </kbd>
        </Fragment>
      );
    })}
  </span>
);

/** All the alternatives for one action, separated by "or". */
export const ShortcutKeys = ({
  combos,
  sequence,
}: {
  combos: KeyCombo[];
  sequence?: boolean;
}) => (
  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
    {combos.map((combo, index) => (
      <Fragment key={index}>
        {index > 0 && <span className="text-ink-muted text-xs">or</span>}
        <Combo keys={combo} sequence={sequence} />
      </Fragment>
    ))}
  </span>
);
