# Formia

**A visual form builder that exports real code, not a runtime you have to keep.**

Drag fields onto a canvas, set validation rules, test the live form, then export a portable **JSON schema** or a ready-to-paste **React component** for **React Hook Form**, **Formik** or **TanStack Form**, styled with **Tailwind** or **Material UI**.

![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript strict](https://img.shields.io/badge/TypeScript-5.9_strict-3178c6?logo=typescript&logoColor=white)
![Vite 7](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Zod 4](https://img.shields.io/badge/Zod-4-3068b7)
![Tailwind 4](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)

## Why

Most form builders make you ship their renderer. Formia's output is **one `.tsx` file you own**: a Zod (or Yup) schema, typed input and output, accessible markup and the form library you already use. Nothing from Formia is imported at runtime.

- **What you test is what you ship.** The preview and the generated code are driven by the same validation description, so they cannot drift apart.
- **Generated code reads like hand-written code.** It is Prettier-formatted, uses each library's idiomatic API, and wires `aria-invalid`, `aria-describedby` and `role="alert"`.

## Features

- **28 element types** (21 inputs, 7 layout/content) from a searchable palette, via drag and drop (pointer and keyboard) or click.
- Two fields per row; headings, dividers and alerts take a full row.
- Per-field editor: label, name, default, options, and validation with custom messages.
- **Undo/redo** (100 steps), debounced **autosave**, 9 built-in **templates** plus your own, validated JSON **import/export**.
- **Live preview** with real validation, desktop/mobile widths and a simulated submit.
- **Six code outputs**: React Hook Form + Zod, Formik + Yup, TanStack Form + Zod, each in Tailwind or MUI, with install commands for npm, pnpm, yarn and bun.

## Quick start

Requires Node 20.19+ or 22.12+.

```bash
git clone https://github.com/AriaNaderidev/dynamic-form-generator.git
cd dynamic-form-generator/form-generator
npm install
npm run dev            # http://localhost:5173
```

| Script | Purpose |
|---|---|
| `npm run build` | `tsc -b && vite build` |
| `npm run preview` | Serve the production build. Use this, not `dev`, to measure performance. |
| `npm run lint` / `npx tsc -b` | ESLint 9 / type-check only |

## Usage

1. Start from a template or drag fields in; click a card's pencil to edit it.
2. Check the **Preview** tab; open **Schema** or **Code** to export.
3. In **Code**, pick a library and UI kit, run the install command, and copy or download the file:

```tsx
<ContactForm onSubmit={async (values) => { await saveToApi(values); }} />
```

Real output for the built-in Contact template (React Hook Form + Zod), trimmed:

```tsx
export const contactFormSchema = z.object({
  email: z.string().min(1, "This field is required").pipe(z.email("Enter a valid email address")),
  message: z.string().min(1, "This field is required").min(10, "Minimum 10 characters"),
});
export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormOutput = z.output<typeof contactFormSchema>;

const { register, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<ContactFormInput, unknown, ContactFormOutput>({
    resolver: zodResolver(contactFormSchema), defaultValues, mode: "onTouched",
  });
```

Shortcuts: `Ctrl/⌘+Z` undo, `Ctrl/⌘+Shift+Z` redo (inactive inside inputs and dialogs). Everything is stored locally in `localStorage` (`form-builder:*` keys); nothing leaves the browser.

## JSON schema

```json
{ "version": 1, "fields": [
  { "id": "aacf75f4-…", "type": "text", "name": "firstName", "label": "First name",
    "validation": { "required": true }, "rowId": "aacf75f4-…" } ] }
```

`id` is a UUID used by the canvas; **`name` is the submitted data key and the generated code key** (it must match `^[A-Za-z_$][\w$-]*$`). Fields sharing a `rowId` render side by side. Import validates `version`, `id`, `name` and `type` and keeps unknown keys, so files survive a round trip. Rules: required, min/max length, pattern, min/max number, earliest/latest date or time (with a `today` token), and file size and types.

## Architecture

```mermaid
flowchart LR
  F["FormField[]"] --> S["toFieldSpec()"]
  S --> P["zodPlan<br/>(chain as data)"]
  P -->|execute| R["live preview"]
  P -->|print| C["generateFormCode()"]
  S --> K["bindings + kits"] --> C
  C --> W["Prettier (Web Worker)"]
```

```
src/features/
  form-schema/   Types, catalog, FieldSpec, Zod plan: the single source of truth
  form-builder/  Canvas, palette, field editor, undo/autosave, dnd
  form-renderer/ Live form rendered from specs
  preview/       Preview, Schema and Code tabs
  codegen/       Bindings (RHF/Formik/TanStack), kits (Tailwind/MUI), printers, formatter
```

- **Validation is defined once.** `toFieldSpec` describes a field; `zodPlan` expresses it as a chain of calls as *data*. The preview executes the plan; the generator prints it. The Yup printer reads the same specs.
- **Codegen is composed, not templated.** A `Binding` per library (how a control connects to state) and a kit per UI library (markup) give 6 outputs from 3 + 2 pieces.
- **All writes go through one `setFields`**, which normalises rows and records history, so every mutation is undoable and canonical.

## Engineering notes

- Split context (data vs stable actions), memoised cards and `useDeferredValue` on the preview keep editing and dragging responsive.
- A custom dnd-kit collision strategy ignores the canvas droppable during reorders, which otherwise "wins" over neighbouring cards and makes items snap back.
- Stored and imported data (autosave, templates, files) is re-validated on read; storage access is wrapped in try/catch.
- Motion is CSS tokens with one global `prefers-reduced-motion` rule; scrollbars are styled by one global rule.

## Performance

Measured on the production build (Lighthouse mobile, simulated slow 4G, 4x CPU):

| | Before | After |
|---|---:|---:|
| Score | 25 | **86** |
| FCP / LCP | 7.5 s / 15.4 s | 2.7 s / 3.6 s |
| Total Blocking Time | 2,670 ms | 40 ms |

Key techniques: per-icon imports (12,888 to 1,978 dev modules), vendor chunking plus lazy Schema/Code tabs and field editor, a 62 KB WebP in place of a 1.37 MB PNG, a Latin-subset font, highlighting via `refractor` and CSS classes instead of per-token React elements, and Prettier in a Web Worker with a result cache (switching library or UI kit: about 3.9 s to 0.3 s on a 10-field form at 4x CPU).

## Extending

- **New field type:** `types.ts`, `catalog.ts`, `palette_config.ts`, a `fieldSpec` kind, a case in `FieldControl.tsx`, and cases in both kits and the binding.
- **New form library:** implement `Binding`, add its dependencies and schema printer in `generate.ts`.
- **New UI kit:** add renderers in `codegen/kits/`.
- **Validation changes** go in `fieldSpec.ts` / `zodPlan.ts` only, then re-check the generated output.

## Tooling and conventions

TypeScript strict, ESLint 9, Prettier (Tailwind plugin), Husky (`pre-commit` runs lint-staged, `pre-push` runs the build). Conventional commits with a scope, one feature per commit. See [`CLAUDE.md`](./CLAUDE.md) for repository conventions.

## Limitations

- **No automated tests yet.** Good first additions: snapshot and type-check tests over `generateFormCode` for all six combinations, and unit tests for `rows_helper` and `toFieldSpec`.
- Two fields per row by design; the preview's submit is simulated; file fields generate validation but not upload handling.
- The generated Tailwind and MUI code assumes those libraries are already set up in your project.
- No license file yet.
