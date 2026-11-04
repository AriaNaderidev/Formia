import { groupIntoRows, isContainerStart, type FieldRow } from "@/utils/rows_helper";
import type { FormField } from "./types";

export type FormSection = {
  key: string;
  /** The section container. `null` for loose fields that sit outside any section. */
  marker: FormField | null;
  rows: FieldRow[];
};

export type FormTab = {
  key: string;
  title: string;
  /** Button text, with the defaults filled in. */
  nextLabel: string;
  previousLabel: string;
  sections: FormSection[];
  /** Every field on the tab, containers excluded. */
  fields: FormField[];
};

export type FormLayoutTree = {
  /** Content before the first tab, or the whole form when there are no tabs. */
  lead: FormSection[];
  tabs: FormTab[];
  /** Content outside the tabs that comes after the first one: shown under them. */
  trail: FormSection[];
};

const DEFAULT_NEXT_LABEL = "Next";
const DEFAULT_PREVIOUS_LABEL = "Previous";

/** A container and what is inside it. Plain fields have no children. */
type Node = { field: FormField; children?: Node[] };

/** Reads the flat list into nodes, closing areas the way `normalizeContainers` would. */
const parse = (fields: FormField[]): Node[] => {
  const root: Node[] = [];
  const open: Node[] = [];
  const current = () => (open.length > 0 ? open[open.length - 1].children! : root);

  for (const field of fields) {
    if (field.type === "end") {
      open.pop();
      continue;
    }
    if (field.type === "tab") open.length = 0;
    else if (field.type === "section" && open[open.length - 1]?.field.type === "section") {
      open.pop();
    }

    const node: Node = isContainerStart(field.type) ? { field, children: [] } : { field };
    current().push(node);
    if (node.children) open.push(node);
  }

  return root;
};

const leaves = (nodes: Node[]): FormField[] =>
  nodes.flatMap((node) => (node.children ? leaves(node.children) : [node.field]));

/** Loose fields between sections become one unnamed segment each; a section is its own. */
const toSections = (nodes: Node[], keyPrefix: string): FormSection[] => {
  const sections: FormSection[] = [];
  let loose: FormField[] = [];

  const flush = () => {
    if (loose.length === 0) return;
    sections.push({ key: `${keyPrefix}:${loose[0].id}`, marker: null, rows: groupIntoRows(loose) });
    loose = [];
  };

  for (const node of nodes) {
    if (node.field.type === "section") {
      flush();
      sections.push({
        key: node.field.id,
        marker: node.field,
        rows: groupIntoRows(leaves(node.children ?? [])),
      });
    } else if (!node.children) {
      loose.push(node.field);
    }
  }
  flush();

  return sections;
};

/**
 * Reads the flat field list as tabs, sections and rows. A tab or section owns what sits
 * between it and its `end`. Fields outside every tab are shown above the tabs (when they
 * come first) or below them. A form with no tab is just `lead`.
 */
export const buildLayout = (fields: FormField[]): FormLayoutTree => {
  const nodes = parse(fields);
  const firstTab = nodes.findIndex((node) => node.field.type === "tab");
  if (firstTab === -1) return { lead: toSections(nodes, "lead"), tabs: [], trail: [] };

  const tabNodes = nodes.filter((node) => node.field.type === "tab");
  const tabs = tabNodes.map((node, index): FormTab => {
    const { field } = node;
    const children = node.children ?? [];
    return {
      key: field.id,
      title: field.label?.trim() || `Step ${index + 1}`,
      nextLabel: field.nextLabel?.trim() || DEFAULT_NEXT_LABEL,
      previousLabel: field.previousLabel?.trim() || DEFAULT_PREVIOUS_LABEL,
      sections: toSections(children, field.id),
      fields: leaves(children),
    };
  });

  return {
    lead: toSections(nodes.slice(0, firstTab), "lead"),
    tabs,
    trail: toSections(nodes.slice(firstTab + 1).filter((node) => node.field.type !== "tab"), "trail"),
  };
};

/** True when the form has tabs and so should render as steps. */
export const isTabbed = (fields: FormField[]) =>
  fields.some((field) => field.type === "tab");
