/**
 * Prettier is ~1 MB, so it is only loaded when generated code is first shown.
 * The promise is cached: later calls reuse the same modules.
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

export const formatCode = async (code: string) => {
  const [standalone, typescript, estree] = await loadPrettier();
  return standalone.format(code, {
    parser: "typescript",
    plugins: [typescript, estree],
    printWidth: 90,
  });
};
