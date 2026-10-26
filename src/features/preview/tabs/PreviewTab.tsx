import { useCallback } from "react";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import type { FormField } from "@/features/form-schema";
import { FormRenderer, type SubmittedForm } from "@/features/form-renderer";
import { SegmentedControl } from "@/ui/SegmentedControl";
import { toast } from "@/ui/toast";
import { oneOf, useLocalStorageState } from "@/utils/useLocalStorageState";
import { SubmissionView } from "../SubmissionView";

type Device = "desktop" | "mobile";

const VALIDATION_TOAST = "preview-validation";

const showSubmission = ({ data, specs }: SubmittedForm) => {
  toast.dismissKey(VALIDATION_TOAST);
  toast.success("Form submitted", {
    key: "preview-submission",
    description:
      specs.length === 1 ? "1 field passed validation" : `${specs.length} fields passed validation`,
    duration: 12000,
    wide: true,
    content: <SubmissionView data={data} specs={specs} />,
  });
};

const showInvalid = (count: number) => {
  toast.error(count === 1 ? "1 field needs attention" : `${count} fields need attention`, {
    description: "Fix the highlighted fields and submit again.",
    key: VALIDATION_TOAST,
  });
};

export const PreviewTab = ({ fields }: { fields: FormField[] }) => {
  const [device, setDevice] = useLocalStorageState<Device>(
    "form-builder:preview-device",
    "desktop",
    oneOf("desktop", "mobile"),
  );
  const onSubmit = useCallback(showSubmission, []);
  const isMobile = device === "mobile";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-ink-muted text-xs">
          Fill it in and submit to see the data your form produces.
        </p>
        <SegmentedControl
          ariaLabel="Preview width"
          size="sm"
          value={device}
          onChange={setDevice}
          className="w-[4.5rem] shrink-0"
          segments={[
            {
              value: "desktop",
              label: "",
              ariaLabel: "Desktop width",
              icon: <DesktopWindowsOutlinedIcon sx={{ fontSize: 15 }} />,
            },
            {
              value: "mobile",
              label: "",
              ariaLabel: "Mobile width",
              icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 15 }} />,
            },
          ]}
        />
      </div>

      <div
        className={`mx-auto w-full transition-[max-width,padding,border-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isMobile
            ? "border-line max-w-[390px] rounded-[1.75rem] border-[6px] px-4 py-6 shadow-[0_12px_32px_-16px_rgba(42,22,51,0.35)]"
            : "max-w-full rounded-none border-0 border-transparent px-0 py-0"
        }`}
      >
        <FormRenderer fields={fields} onSubmit={onSubmit} onInvalid={showInvalid} />
      </div>
    </div>
  );
};
