# CLAUDE.md

Guidance for working in this repository. Read this before making changes.

## What this project is

**Form Generator**: a visual builder for forms. The user drags fields from a palette onto a canvas, edits each field's settings and validation rules, previews the result live, and exports it as a JSON schema or as ready-to-use React code (React Hook Form, Formik, or TanStack Form; Tailwind or MUI).

Branch in progress: `5-refactor-form-renderer`. The default branch for PRs is `main`.

## Stack

- React 19, TypeScript 5.9 (strict), Vite 7, SWC (`@vitejs/plugin-react-swc`)
- Tailwind CSS v4 (`@tailwindcss/vite`), tokens in `src/index.css` `@theme`
- MUI v9 (`@mui/material`, `@mui/icons-material`) with a theme in `src/theme/theme.ts`
- dnd-kit for drag and drop
- React Hook Form for the editor and the preview
- Zod v4 for validation (`zod`, `@hookform/resolvers`)
- Prettier 3 (`prettier-plugin-tailwindcss`), ESLint 9 flat config, Husky + lint-staged

## Commands

```bash
npm run dev       # Vite dev server, default port 5173
npm run build     # tsc -b && vite build. Run before calling work done.
npm run lint      # eslint .
npx tsc -b        # type-check only (faster than a full build)
```

There is no test suite yet. Verify behaviour by running the app (`npm run dev`) and exercising the feature in a browser.

The first page load after starting the dev server takes about 20 seconds (on-demand module transforms). That is normal. Do not treat it as a hang or a crash.

## Layout

```
src/
  features/
    form-builder/      Builder page: canvas, palette, field editor, header, undo/autosave
      components/      Canvas/, Palette/, FieldEditor/, AppHeader.tsx
      context/         Split context: fields (data) vs actions (stable setters)
      hooks/           dnd, history (undo/autosave), editor state
    form-schema/       Single source of truth for fields
      types.ts         FormField, FieldType, validation shape, FIELD_NAME_PATTERN
      catalog.ts       Default field per type (the palette entries)
      fieldSpec.ts     Library-agnostic value + rule description of each field
      zodPlan.ts       That spec as a Zod chain: runs at runtime AND prints source
      buildZodSchema.ts / toFormSchema.ts / templates.ts / temporalBounds.ts
    form-renderer/     Live form rendered from specs (MUI controls, animated errors)
    preview/           Right-hand panel: Preview, Schema and Code tabs
      tabs/            PreviewTab, SchemaTab, CodeTab (+ CodePanel)
    codegen/           Turns fields into a .tsx file for a chosen library and UI kit
      bindings.ts      Per-library wiring (RHF / Formik / TanStack)
      kits/            Tailwind and MUI markup
      schemas.ts       Yup printer (Formik) and Zod object printer
      generate.ts      Assembles the file. format.ts lazy-loads Prettier.
  ui/                  Shared UI: toast/, SegmentedControl, CopyButton, CodeBlock
  utils/               rows_helper (row grouping, insertion, reorder), download, localStorage hook
  theme/               MUI theme
```

## Core model: fields, rows, specs

- `FormField` is the stored shape. `id` is a UUID used by the canvas. `name` is the **submitted data key and the generated code key**. Keep those two separate.
- Fields are grouped into rows with `rowId`. A row holds at most two fields, and full-width elements (heading, divider, alert) always take a whole row. Use the helpers in `utils/rows_helper.ts`. Do not hand-roll row logic.
- Every write to fields goes through `setFields` from the builder, which normalises rows and records undo history.
- **Validation lives in one place.** `toFieldSpec` (`fieldSpec.ts`) describes each field. `zodPlan.ts` turns that into a Zod chain that is both executed (preview) and printed (generated code). If you change validation behaviour, change it in the spec/plan, then check the generated output too. Never duplicate rule logic in a component.
- New field types need: an entry in `types.ts`, `catalog.ts`, `PALETTE_META` in `palette_config.ts`, a `fieldSpec` kind, a renderer case in `FieldControl.tsx`, and codegen cases in both kits and the binding.

## Code conventions

- **Imports**: use the `@/` alias for `src/`. Existing files mix relative and alias imports. Prefer `@/` in new code.
- **Naming**: components `PascalCase.tsx`. Hooks `useSomething.ts`. Pure helpers can be camelCase or snake_case in existing files. Match the file you are editing. (`rows_helper.ts`, `palette_config.ts` are snake_case. Most new files are camelCase.)
- **Comments**: short JSDoc on exported functions and components when the reason is not obvious. Explain *why*, not *what*. Match the density of the surrounding file.
- **Performance patterns already in use, keep them**:
  - Memoised row and card components with stable props (`memo`, `useCallback`).
  - Write-only components use `useFormBuilderActions()`, not `useFormBuilderContext()`, so they do not re-render on every field change.
  - Heavy libraries load lazily (`React.lazy` for the Schema/Code tabs and the field editor; Prettier via dynamic import).
  - `useDeferredValue` on the fields that feed the preview.
- **Styling**: Tailwind utilities for the builder shell and the preview; MUI components for form controls and dialogs. Colour tokens are `plum`, `mauve`, `ink`, `ink-muted`, `line`, `canvas` (defined in `index.css`, mirrored in `theme.ts`). Keep those two files in sync.
- **Motion**: CSS animations are defined as tokens in `index.css` (`animate-fade-up`, `animate-toast-in`, and so on). Use the tokens. Every decorative animation must respect `prefers-reduced-motion`, which the global rule in `index.css` covers. Do not add JS-driven animation where CSS does the job.
- **Persisted preferences** use `useLocalStorageState` (wrapped in try/catch). Keep the stored values small. Do not store field data this way. Autosave uses `form-builder:schema`.
- **Generated code** must type-check and read like hand-written code. Changes to `codegen/` should be checked by generating a form and type-checking the output, not just by reading the string.

## Git and commits

These conventions are the user's own. Follow them.

- **Conventional commits with a scope**, matching history: `type(Scope): Subject`. Subject starts with a capital letter, no trailing period.
  - Types used: `feat`, `fix`, `refactor`, `chore`, `perf`.
  - Examples: `feat(Canvas): Add delete animation with undo`, `fix(Palette): Fix the correctness of palette components' imports`.
- **One feature per commit.** When asked to commit a body of work, split it into separate commits, one per feature, ordered so each commit's dependencies come earlier. Do not put unrelated changes in one commit.
- **Commit only when asked.** Do not push, and do not open a PR, unless the user asks.
- **End every commit message with the trailer** `Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>`. Use the model name in use. Pass it with `-m` as a separate paragraph.
- **Pre-commit hook** runs `lint-staged`, which runs `eslint --fix` on staged JS/TS files. If it fails, fix the code and make a new commit. Never use `--no-verify`.
- Line endings: `core.autocrlf` is `true` on this machine and many existing files are CRLF. Git will warn "LF will be replaced by CRLF". Those warnings are expected. Do not reformat unrelated files to change line endings.

## Working with this machine

- The shell is Windows: Git Bash for the Bash tool, PowerShell for the PowerShell tool. Use forward slashes in Bash and `/c/...`-style paths where needed.
- **Edit files with the Edit or Write tools.** Do not rewrite source files with `sed` or inline `node -e` scripts. Shell quoting has repeatedly eaten backslashes in regexes and template strings, which silently broke edits.
- **Deletions**: do not use `rm` with glob patterns in the Bash tool. The safety check blocks them. Delete named files one at a time, or use the Edit/Write tools, and check the target first.
- Background installs from npm can hang or fail on the network. If `npm install` stalls, check the process and retry with `--fetch-timeout`. Do not assume it succeeded.
- Scratch work (test harnesses, generated samples, screenshots) goes in the session scratchpad, not in the repo.

## Verification before reporting done

1. `npx tsc -b` passes.
2. `npx eslint src` has no new errors. Existing warnings in `DefaultValueControl.tsx` (`no-explicit-any`) predate this work.
3. For UI changes: run `npm run dev`, exercise the feature in a browser, and check the browser console for errors.
4. For codegen changes: generate output for the affected library and UI kit and type-check it.
5. Report results faithfully. If a check was skipped or failed, say so with the output.

## Things to avoid

- Do not add comment blocks that restate the code.
- Do not duplicate validation or row logic in components.
- Do not persist field data in `localStorage` other than the autosave key.
- Do not add dependencies for something a few lines of code cover.
- Do not change the palette order, field catalog defaults, or existing commit history without asking.
- Do not commit, push, or open PRs on your own initiative.
