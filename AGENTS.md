# lifeOS — Agent instructions

## Framework quirks

- **Next.js 16 + React 19** — breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
- **Tailwind CSS v4** — uses `@import "tailwindcss"` (no `@tailwind` directives), `@theme inline` block for theme tokens, PostCSS plugin `@tailwindcss/postcss`. No `tailwind.config.*` file.
- **shadcn/ui style `base-nova`** (not `default` or `new-york`). Run `npx shadcn@latest add <component>` to add new components.
- **`@base-ui/react` uses `render` prop, NOT `asChild`** — Radix UI's `asChild` does not exist in Base UI. To replace a component's default element, pass a ReactElement to the `render` prop (e.g. `<Button render={<a href="...">link</a>} />`). All usages in this codebase use `render`.
- **ESLint v9 flat config** — `eslint.config.mjs` using `defineConfig` from `eslint/config`, NOT `.eslintrc*`.
- **TypeScript strict mode** enabled. Path alias `@/*` → `./src/*`.

## Commands

```sh
npm run dev      # dev server
npm run build    # production build
npm run lint     # ESLint (flat config)
```

No test framework is configured. No CI/CD.

## Project structure

- **`src/`** — Next.js App Router application
- **Dashboard/ Areas/ Projects/ Seasons/ Journal/ Learning/ Resources/ Templates/** — Obsidian vault (markdown), co-exists with the app. Do not touch unless the task explicitly targets vault content.

### Routing

Two route groups under `src/app/`:

| Group | Files | Access |
|-------|-------|--------|
| `(auth)` | `login`, `register` | Public |
| `(dashboard)` | `habits`, `inbox`, `journal`, `learning`, `projects`, `resources`, `seasons`, `tasks`, `profile`, `page.tsx` (home) | Protected — redirects to `/login` if unauthenticated |

Sidebar links to `/settings` exist but the page is **not yet implemented**.

### Feature modules

Each domain lives in `src/features/<name>/` with:
- `use<Name>.ts` — React Query hooks + Firebase Firestore calls
- `XForm.tsx` — shadcn-based form components

React Query query key pattern: `[resource, userId, ...filters]`
Mutations invalidate related queries on success.

## Firebase

Backend is Firebase (Auth, Firestore, Storage). All Firestore queries filter by `userId` for data isolation.

**Two entrypoints for code splitting:**
- `src/lib/firebase-auth.ts` — Firebase App + Auth only. Used by public pages (`/login`, `/register`) and `AuthContext`. Does NOT bundle Firestore/Storage.
- `src/lib/firebase.ts` — Re-exports everything (app, auth, db, storage). Used by dashboard feature hooks that need Firestore.

The `AuthProvider` lives only in `(dashboard)/layout.tsx`, not in the root layout. Public routes never initialize Firebase Firestore/Storage.

Required env vars (see `.env.local.example`):
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Business rules enforced in code

- **Max 3 active projects** per user (`src/features/projects/useProjectMutations.ts:16`)
- **Only one active season** — creating a new one deactivates the old via Firestore batch write (`src/features/seasons/useSeasonMutations.ts:15`)
- Tasks should be atomic (small, actionable) — word count validation in `TaskForm.tsx`

## Locale

UI language is **Portuguese (PT-BR)** — `lang="pt-BR"` in root layout. Strings, error messages, and content are in Portuguese.

## Performance patterns

- **framer-motion removed** — page transitions use Tailwind's built-in `animate-in` classes instead of a 120 KB animation library.
- **Suspense boundaries** wrap `Sidebar` and page content in the dashboard layout for progressive rendering.
- **`next/dynamic`** is preferred for heavy components that are not immediately visible.

## Available libraries (not yet heavily used)

`react-hook-form` v7 and `zod` v4 are in dependencies but the app primarily uses React Query + Firebase directly. Use them when appropriate but prefer the established React Query + Firebase pattern for new data features.

## Package name note

The npm package is named `"temp-app"` — this is incidental. The real project is **lifeOS**. Do not rename.
