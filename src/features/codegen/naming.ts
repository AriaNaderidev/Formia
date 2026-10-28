const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** Object key: `name` or `"odd-name"`. */
export const propKey = (name: string) =>
  IDENTIFIER.test(name) ? name : JSON.stringify(name);

/** Member access: `obj.name` or `obj["odd-name"]`. */
export const member = (object: string, name: string) =>
  IDENTIFIER.test(name)
    ? `${object}.${name}`
    : `${object}[${JSON.stringify(name)}]`;

/** Optional member access: `obj?.name` or `obj?.["odd-name"]`. */
export const optionalMember = (object: string, name: string) =>
  IDENTIFIER.test(name)
    ? `${object}?.${name}`
    : `${object}?.[${JSON.stringify(name)}]`;

const words = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

const capitalize = (word: string) =>
  word[0].toUpperCase() + word.slice(1).toLowerCase();

export const toPascalCase = (text: string) =>
  words(text).map(capitalize).join("").replace(/^\d+/, "");

export const toCamelCase = (text: string) => {
  const pascal = toPascalCase(text);
  return pascal ? pascal[0].toLowerCase() + pascal.slice(1) : "";
};

export const DEFAULT_COMPONENT_NAME = "GeneratedForm";

/** Anything the user types becomes a valid React component name. */
export const toComponentName = (text: string) =>
  toPascalCase(text) || DEFAULT_COMPONENT_NAME;

/** Text between JSX tags. Braces and angle brackets would be parsed as code. */
export const jsxText = (text: string) =>
  /[{}<>&]/.test(text) ? `{${JSON.stringify(text)}}` : text;

/** A JSX string attribute value, including the quotes or braces. */
export const jsxString = (text: string) =>
  /["\\\n]/.test(text) ? `{${JSON.stringify(text)}}` : `"${text}"`;
