import {
  lazy,
  Suspense,
  useDeferredValue,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  useFormBuilderContext,
  useFormDirection,
} from "../form-builder/context/useFormBuilderContext";
import { warmFormatter } from "@/features/codegen";
import { SegmentedControl } from "@/ui/SegmentedControl";
import { oneOf, useLocalStorageState } from "@/utils/useLocalStorageState";
import { PreviewTab } from "./tabs/PreviewTab";

// Syntax highlighting and Prettier are heavy and only needed on these tabs.
const loadSchemaTab = () => import("./tabs/SchemaTab");
const loadCodeTab = () => import("./tabs/CodeTab");
const SchemaTab = lazy(loadSchemaTab);
const CodeTab = lazy(loadCodeTab);

/**
 * Fetches the lazy tabs (and starts the Prettier worker) once the app is idle. A chunk that is
 * only requested on first open fails if the connection is gone by then; this fetches it while online.
 */
const prefetchTabs = () => {
  void loadSchemaTab();
  void loadCodeTab();
  warmFormatter();
};

type TabId = "preview" | "schema" | "code";
const ID = "preview-panel";

const TABS = [
  {
    value: "preview" as const,
    label: "Preview",
    icon: <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />,
  },
  {
    value: "schema" as const,
    label: "Schema",
    icon: <DataObjectRoundedIcon sx={{ fontSize: 16 }} />,
  },
  {
    value: "code" as const,
    label: "Code",
    icon: <CodeRoundedIcon sx={{ fontSize: 16 }} />,
  },
];

const PanelSkeleton = () => (
  <div className="flex flex-col gap-3" aria-hidden>
    <div className="bg-plum/[0.06] h-8 w-2/3 animate-pulse rounded-lg" />
    <div className="h-72 animate-pulse rounded-xl bg-[#282c34]/90" />
  </div>
);

/**
 * A panel mounts the first time it is opened and then stays mounted (hidden),
 * so typed values and scroll position survive switching tabs.
 */
const TabPanel = ({
  id,
  active,
  visited,
  children,
}: {
  id: TabId;
  active: boolean;
  visited: boolean;
  children: ReactNode;
}) => (
  <div
    role="tabpanel"
    id={`${ID}-panel-${id}`}
    aria-labelledby={`${ID}-tab-${id}`}
    hidden={!active}
    // Animations restart whenever a hidden element is shown again.
    className="animate-fade-up"
  >
    {visited ? children : null}
  </div>
);

export const PreviewPanel = () => {
  const { fields } = useFormBuilderContext();
  const direction = useFormDirection();
  // Rendering the preview can wait a frame; dragging and editing the canvas cannot.
  const deferredFields = useDeferredValue(fields);

  const [active, setActive] = useLocalStorageState<TabId>(
    "form-builder:preview-tab",
    "preview",
    oneOf("preview", "schema", "code"),
  );
  const [visited, setVisited] = useState<Set<TabId>>(() => new Set([active]));

  useEffect(() => {
    // Safari has no requestIdleCallback.
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(prefetchTabs, { timeout: 5000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = globalThis.setTimeout(prefetchTabs, 2000);
    return () => globalThis.clearTimeout(timer);
  }, []);

  const open = (tab: TabId) => {
    setActive(tab);
    setVisited((prev) => (prev.has(tab) ? prev : new Set(prev).add(tab)));
  };

  return (
    <aside
      aria-label="Preview and export"
      className="flex min-h-0 flex-1 flex-col p-2 sm:p-4 xl:ps-0"
    >
      <div className="border-line flex min-h-0 flex-1 flex-col rounded-2xl border bg-white shadow-sm">
        <header className="border-line flex flex-col gap-3 border-b px-4 pt-4 pb-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-ink text-base font-semibold">Preview &amp; export</h2>
            <span className="text-ink-muted text-xs">Live</span>
          </div>
          <SegmentedControl
            kind="tabs"
            idPrefix={ID}
            ariaLabel="Preview panel"
            value={active}
            onChange={open}
            segments={TABS}
          />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-gutter:stable]">
          <TabPanel id="preview" active={active === "preview"} visited>
            <PreviewTab fields={deferredFields} direction={direction} />
          </TabPanel>
          <Suspense fallback={<PanelSkeleton />}>
            <TabPanel id="schema" active={active === "schema"} visited={visited.has("schema")}>
              <SchemaTab fields={deferredFields} direction={direction} />
            </TabPanel>
            <TabPanel id="code" active={active === "code"} visited={visited.has("code")}>
              <CodeTab
                fields={deferredFields}
                direction={direction}
                active={active === "code"}
              />
            </TabPanel>
          </Suspense>
        </div>
      </div>
    </aside>
  );
};
