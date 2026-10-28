import { memo } from "react";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import type { FormField } from "@/features/form-schema";

const HEADING_VARIANTS = {
  h1: "h4",
  h2: "h5",
  h3: "h6",
  h4: "subtitle1",
} as const;

type LayoutElementProps = {
  field: FormField;
  isSubmitting: boolean;
  onReset: () => void;
};

/** Headings, text, dividers, images and buttons: everything that holds no value. */
export const LayoutElement = memo(function LayoutElement({
  field,
  isSubmitting,
  onReset,
}: LayoutElementProps) {
  const className = field.className || undefined;

  switch (field.type) {
    case "heading": {
      const level = field.headingLevel ?? "h2";
      return (
        <Typography
          variant={HEADING_VARIANTS[level]}
          component={level}
          className={className}
          sx={{ color: "text.primary" }}
        >
          {field.content}
        </Typography>
      );
    }

    case "paragraph":
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          className={className}
          sx={{ whiteSpace: "pre-line" }}
        >
          {field.content}
        </Typography>
      );

    case "alert":
      return (
        <Alert
          severity={field.severity ?? "info"}
          className={className}
          sx={{ borderRadius: 2 }}
        >
          {field.content}
        </Alert>
      );

    case "divider":
      return <Divider className={className} />;

    case "spacer":
      return <div aria-hidden style={{ height: field.height ?? 24 }} />;

    case "image":
      return field.src ? (
        <img
          src={field.src}
          alt={field.alt ?? ""}
          loading="lazy"
          style={{ height: field.height ?? 160 }}
          className={`w-full rounded-xl object-cover ${className ?? ""}`}
        />
      ) : (
        <div
          style={{ height: field.height ?? 160 }}
          className="border-line text-ink-muted grid w-full place-items-center rounded-xl border-2 border-dashed text-xs"
        >
          <span className="flex flex-col items-center gap-1">
            <ImageOutlinedIcon fontSize="small" />
            Set an image URL in the editor
          </span>
        </div>
      );

    case "button": {
      const variant = field.buttonVariant ?? "contained";
      const type = field.buttonType ?? "submit";
      return (
        <Button
          type={type === "submit" ? "submit" : "button"}
          variant={variant}
          loading={type === "submit" ? isSubmitting : undefined}
          onClick={type === "reset" ? onReset : undefined}
          className={className}
        >
          {field.label || "Submit"}
        </Button>
      );
    }

    default:
      return null;
  }
});
