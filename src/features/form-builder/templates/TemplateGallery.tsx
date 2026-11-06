import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
} from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import {
  countElements,
  TEMPLATE_FAMILIES,
  type FormTemplate,
  type TemplateFamily,
  type TemplateLanguage,
} from "@/features/form-schema";
import { toast } from "@/ui/toast";
import { focusWhenReady } from "@/utils/focus";
import { userTemplates, useUserTemplates } from "./userTemplates";

const ICONS: Record<string, ElementType> = {
  contact: MailOutlineRoundedIcon,
  signup: PersonAddAlt1OutlinedIcon,
  feedback: StarBorderIcon,
  login: LoginOutlinedIcon,
  newsletter: MarkEmailReadOutlinedIcon,
  "job-application": BadgeOutlinedIcon,
  "event-registration": ConfirmationNumberOutlinedIcon,
  "support-ticket": SupportAgentOutlinedIcon,
  appointment: CalendarMonthOutlinedIcon,
  meeting: GroupsOutlinedIcon,
  user: ManageAccountsOutlinedIcon,
};

/** A template saved by the user, or a shipped one that comes in several languages. */
type GalleryItem = FormTemplate | TemplateFamily;

const isFamily = (item: GalleryItem): item is TemplateFamily =>
  "variants" in item;

const LANGUAGES: { id: TemplateLanguage; short: string; name: string }[] = [
  { id: "en", short: "EN", name: "English" },
  { id: "fa", short: "فا", name: "Persian" },
];

type TemplateGalleryProps = {
  onSelect: (template: FormTemplate) => void;
};

const NAV_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

const getCards = (root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLElement>("[data-template-card]"));

/**
 * The card an arrow key leads to. The grid has one to three columns depending on the
 * width, so up and down are worked out from where the cards actually are: the nearest
 * row in that direction, then the closest card within it.
 */
const neighbourCard = (cards: HTMLElement[], index: number, key: string) => {
  if (key === "ArrowLeft") return cards[index - 1];
  if (key === "ArrowRight") return cards[index + 1];
  if (key === "Home") return cards[0];
  if (key === "End") return cards[cards.length - 1];
  if (key !== "ArrowUp" && key !== "ArrowDown") return undefined;

  const centre = (card: HTMLElement) => {
    const rect = card.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };
  const from = centre(cards[index]);
  const direction = key === "ArrowDown" ? 1 : -1;

  let best: HTMLElement | undefined;
  let bestScore = Infinity;
  for (const card of cards) {
    const to = centre(card);
    const dy = (to.y - from.y) * direction;
    if (dy < 8) continue;
    const score = dy * 1000 + Math.abs(to.x - from.x);
    if (score < bestScore) {
      best = card;
      bestScore = score;
    }
  }
  return best;
};

const LanguageToggle = ({
  value,
  onChange,
}: {
  value: TemplateLanguage;
  onChange: (language: TemplateLanguage) => void;
}) => (
  <div
    role="group"
    aria-label="Template language"
    className="border-line absolute end-2.5 top-2 inline-flex rounded-full border bg-white p-0.5 text-[11px] font-medium"
  >
    {LANGUAGES.map(({ id, short, name }) => (
      <button
        key={id}
        type="button"
        lang={id}
        aria-label={name}
        aria-pressed={value === id}
        onClick={() => onChange(id)}
        className={`focus-visible:outline-plum min-w-8 rounded-full px-2 py-0.5 transition-colors duration-150 focus-visible:outline-2 ${
          value === id ? "bg-plum text-white" : "text-ink-muted hover:text-plum"
        }`}
      >
        {short}
      </button>
    ))}
  </div>
);

const TemplateCard = ({
  item,
  index,
  onSelect,
}: {
  item: GalleryItem;
  index: number;
  onSelect: (template: FormTemplate) => void;
}) => {
  const metaId = useId();
  const [language, setLanguage] = useState<TemplateLanguage>("en");
  const family = isFamily(item);
  const template = isFamily(item) ? item.variants[language] : item;
  const Icon = ICONS[item.id] ?? BookmarkBorderIcon;
  const count = countElements(template);

  const remove = () => {
    const all = userTemplates.getAll();
    const position = all.findIndex((item) => item.id === template.id);

    // The card is about to disappear: keep keyboard focus on a neighbour.
    const cards = getCards(document);
    const current = cards.findIndex(
      (card) => card.dataset.templateId === template.id,
    );
    const neighbour = cards[current + 1] ?? cards[current - 1];
    const hadFocus =
      current !== -1 && cards[current] === document.activeElement;

    userTemplates.remove(template.id);
    if (hadFocus && neighbour) {
      const id = neighbour.dataset.templateId;
      focusWhenReady(() =>
        document.querySelector<HTMLElement>(`[data-template-id="${id}"]`),
      );
    }
    toast.info(`Deleted “${template.title}”`, {
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => userTemplates.restore(template, position),
      },
    });
  };

  return (
    <li
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className="animate-fade-up group/card relative w-64 shrink-0 snap-start max-sm:w-[78%]"
    >
      <button
        type="button"
        data-template-card
        data-template-id={item.id}
        aria-describedby={metaId}
        aria-keyshortcuts={template.custom ? "Delete" : undefined}
        onKeyDown={(event) => {
          const plain = !event.altKey && !event.ctrlKey && !event.metaKey;
          if (
            template.custom &&
            plain &&
            (event.key === "Delete" || event.key === "Backspace")
          ) {
            event.preventDefault();
            remove();
          }
        }}
        onClick={() => onSelect(template)}
        className={`border-line hover:border-plum/60 focus-visible:outline-plum flex h-full w-full items-start gap-3 rounded-2xl border bg-white p-3.5 text-start ${family ? "pt-12" : ""} shadow-sm transition-[border-color,box-shadow,translate,scale] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 active:scale-[0.98]`}
      >
        <span
          aria-hidden
          className="bg-plum/[0.07] text-plum group-hover/card:bg-plum grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200 group-hover/card:text-white"
        >
          <Icon fontSize="small" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            dir="auto"
            className="text-ink block truncate pe-6 text-sm font-semibold"
          >
            {template.title}
          </span>
          <span
            id={metaId}
            dir="auto"
            className="text-ink-muted mt-0.5 line-clamp-2 block text-xs leading-relaxed"
          >
            {template.description}
            <span className="sr-only">. </span>
            <span className="text-ink-muted/80 mt-1 block text-[11px]">
              {count} {count === 1 ? "element" : "elements"}
            </span>
          </span>
        </span>
      </button>

      {template.custom ? (
        <button
          type="button"
          aria-label={`Delete template ${template.title}`}
          onClick={remove}
          className="text-ink-muted focus-visible:outline-plum absolute end-2 top-2 grid size-8 place-items-center rounded-full opacity-0 transition-[opacity,color,background-color] duration-150 group-focus-within/card:opacity-100 group-hover/card:opacity-100 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 [@media(pointer:coarse)]:opacity-100"
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
        </button>
      ) : null}

      {family ? (
        <LanguageToggle value={language} onChange={setLanguage} />
      ) : null}
    </li>
  );
};

const ScrollButton = ({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={`Scroll templates ${direction}`}
    className="border-line text-ink-muted hover:border-plum hover:text-plum focus-visible:outline-plum grid size-8 place-items-center rounded-full border bg-white transition-[color,border-color,opacity,scale] duration-150 focus-visible:outline-2 active:scale-90 disabled:pointer-events-none disabled:opacity-35"
  >
    {direction === "left" ? (
      <ChevronLeftRoundedIcon fontSize="small" />
    ) : (
      <ChevronRightRoundedIcon fontSize="small" />
    )}
  </button>
);

const Group = ({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: GalleryItem[];
  onSelect: (template: FormTemplate) => void;
}) => {
  const headingId = useId();
  const row = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  // Which way there is more to see: the chevrons only enable for those.
  const updateEdges = useCallback(() => {
    const element = row.current;
    if (!element) return;
    const start = element.scrollLeft <= 1;
    const end =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;
    setEdges((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end },
    );
  }, []);

  useEffect(() => {
    const element = row.current;
    if (!element) return;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateEdges, items.length]);

  /** About two cards at a time, smoothly unless the user asked for less motion. */
  const scrollRow = (direction: -1 | 1) => {
    const element = row.current;
    if (!element) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element.scrollBy({
      left: direction * Math.max(element.clientWidth * 0.8, 260),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const overflows = !(edges.start && edges.end);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h3
          id={headingId}
          className="text-ink-muted text-xs font-semibold tracking-wide uppercase"
        >
          {title}
          <span className="text-ink-muted/70 ms-1.5 font-normal normal-case">
            {items.length}
          </span>
        </h3>
        {overflows ? (
          <div className="flex shrink-0 items-center gap-1">
            <ScrollButton
              direction="left"
              disabled={edges.start}
              onClick={() => scrollRow(-1)}
            />
            <ScrollButton
              direction="right"
              disabled={edges.end}
              onClick={() => scrollRow(1)}
            />
          </div>
        ) : null}
      </div>
      {/* One scrolling row per group, so the page never grows taller as templates are added. */}
      <ul
        ref={row}
        onScroll={updateEdges}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-3 sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {items.map((item, index) => (
          <TemplateCard
            key={item.id}
            item={item}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </section>
  );
};

/** Shipped templates plus the ones the user saved from their own forms. */
export const TemplateGallery = ({ onSelect }: TemplateGalleryProps) => {
  const custom = useUserTemplates();

  /** Arrow keys, Home and End walk the cards; Tab still reaches each one too. */
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const cards = getCards(event.currentTarget);
    const index = cards.findIndex((card) => card === document.activeElement);
    if (index === -1) return;

    if (!NAV_KEYS.has(event.key)) return;
    event.preventDefault();
    neighbourCard(cards, index, event.key)?.focus();
  };

  return (
    <section
      aria-labelledby="template-gallery-title"
      onKeyDown={onKeyDown}
      className="flex w-full flex-col gap-3"
    >
      <div>
        <h2
          id="template-gallery-title"
          className="text-ink text-base font-semibold"
        >
          Start from a template
        </h2>
        <p className="text-ink-muted text-sm">
          Pick one to fill the canvas, in English or Persian, then change
          anything you like.
        </p>
      </div>
      {custom.length > 0 ? (
        <Group title="Your templates" items={custom} onSelect={onSelect} />
      ) : null}
      <Group title="Templates" items={TEMPLATE_FAMILIES} onSelect={onSelect} />
    </section>
  );
};
