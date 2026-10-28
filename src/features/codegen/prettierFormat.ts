/**
 * Prettier is ~1 MB, so it is only loaded when generated code is first formatted.
 * The promise is cached: later calls reuse the same modules.
 * Runs inside `format.worker.ts`; `format.ts` only imports it as a fallback.
 */
let prettier: Promise<
  [
    typeof import("prettier/standalone"),
    typeof import("prettier/plugins/typescript"),
    typeof import("prettier/plugins/estree"),
  ]
> | null = null;

const loadPrettier = () =>
  (prettier ??= Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/typescript"),
    import("prettier/plugins/estree"),
  ]));

export const prettierFormat = async (code: string) => {
  const [standalone, typescript, estree] = await loadPrettier();
  return standalone.format(code, {
    parser: "typescript",
    plugins: [typescript, estree],
    printWidth: 90,
  });
};
