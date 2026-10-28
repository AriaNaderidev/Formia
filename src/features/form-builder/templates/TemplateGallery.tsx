import { useId, type ElementType } from "react";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { FORM_TEMPLATES, type FormTemplate } from "@/features/form-schema";
import { toast } from "@/ui/toast";
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
};

type TemplateGalleryProps = {
  onSelect: (template: FormTemplate) => void;
};

const TemplateCard = ({
  template,
  index,
  onSelect,
}: {
  template: FormTemplate;
  index: number;
  onSelect: (template: FormTemplate) => void;
}) => {
  const metaId = useId();
  const Icon = ICONS[template.id] ?? BookmarkBorderIcon;
  const count = template.fields.length;

  const remove = () => {
    const all = userTemplates.getAll();
    const position = all.findIndex((item) => item.id === template.id);
    userTemplates.remove(template.id);
    toast.info(`Deleted “${template.title}”`, {
      duration: 6000,
      action: { label: "Undo", onClick: () => userTemplates.restore(template, position) },
    });
  };

  return (
    <li
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className="animate-fade-up group/card relative"
    >
      <button
        type="button"
        aria-describedby={metaId}
        onClick={() => onSelect(template)}
        className="border-line hover:border-plum/60 focus-visible:outline-plum flex h-full w-full items-start gap-3 rounded-2xl border bg-white p-3.5 text-start shadow-sm transition-[border-color,box-shadow,translate,scale] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 active:scale-[0.98]"
      >
        <span
          aria-hidden
          className="bg-plum/[0.07] text-plum group-hover/card:bg-plum grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200 group-hover/card:text-white"
        >
          <Icon fontSize="small" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-ink block truncate pe-6 text-sm font-semibold">
            {template.title}
          </span>
          <span id={metaId} className="text-ink-muted mt-0.5 block text-xs leading-relaxed">
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
    </li>
  );
};

const Group = ({
  title,
  templates,
  onSelect,
}: {
  title: string;
  templates: FormTemplate[];
  onSelect: (template: FormTemplate) => void;
}) => {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
      <h3 id={headingId} className="text-ink-muted text-xs font-semibold tracking-wide uppercase">
        {title}
        <span className="text-ink-muted/70 ms-1.5 font-normal normal-case">
          {templates.length}
        </span>
      </h3>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} onSelect={onSelect} />
        ))}
      </ul>
    </section>
  );
};

/** Shipped templates plus the ones the user saved from their own forms. */
export const TemplateGallery = ({ onSelect }: TemplateGalleryProps) => {
  const custom = useUserTemplates();

  return (
    <section aria-labelledby="template-gallery-title" className="flex w-full flex-col gap-5">
      <div>
        <h2 id="template-gallery-title" className="text-ink text-base font-semibold">
          Start from a template
        </h2>
        <p className="text-ink-muted text-sm">
          Pick one to fill the canvas, then change anything you like.
        </p>
      </div>
      {custom.length > 0 ? (
        <Group title="Your templates" templates={custom} onSelect={onSelect} />
      ) : null}
      <Group title="Common templates" templates={FORM_TEMPLATES} onSelect={onSelect} />
    </section>
  );
};
