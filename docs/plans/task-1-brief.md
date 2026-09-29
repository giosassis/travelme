# Task 1 Brief — Project Scaffolding

## Context
This is Task 1 of 11 for the TravelMe project. TravelMe is a mobile-first React PWA for personal travel planning. This task bootstraps the entire project from a blank workspace.

## Requirements

Read `docs/plans/2025-01-travelme.md` Task 1 for full details. Summary:

### What to build
- Vite + React + TypeScript project (template: react-ts)
- Tailwind CSS v4 via `@tailwindcss/vite`
- PWA via `vite-plugin-pwa` with Workbox
- Path alias `@/` → `src/`
- CSS custom properties for the color palette
- `src/lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)
- Placeholder `src/App.tsx` that renders "TravelMe" in `#8B7CF6` on `#F8F7FC` background
- `.env.example` documenting `VITE_GOOGLE_MAPS_API_KEY`
- PWA manifest with name "TravelMe", theme_color `#8B7CF6`
- Placeholder PNG icons in `public/icons/`

### Dependencies to install
```
npm install react-router-dom idb recharts lucide-react
npm install -D tailwindcss @tailwindcss/vite autoprefixer vite-plugin-pwa
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-separator @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-progress @radix-ui/react-label @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### Color palette CSS variables (in `src/index.css`)
```css
--color-bg: #F8F7FC
--color-surface: #FFFFFF
--color-primary: #8B7CF6
--color-primary-light: #EAE7FF
--color-teal: #315C68
--color-teal-light: #DCECEF
--color-text: #252333
--color-muted: #777487
--color-success: #5E9C76
--color-danger: #D96C6C
--color-warning: #D5A94F
```

### Tailwind config extends colors
Map CSS vars to Tailwind color tokens: `bg`, `surface`, `primary`, `primary-light`, `teal`, `teal-light`, `app-text`, `muted`, `success`, `danger`, `warning`.

### TypeScript config
- strict: true
- noUnusedLocals: true, noUnusedParameters: true
- paths: `@/*` → `./src/*`
- moduleResolution: bundler

### Verification
`npm run dev` → blank page with "TravelMe" in lilac. `npm run build` → succeeds with no TS errors.

## Global Constraints
- ALL UI text pt-BR
- No `any` TypeScript types
- No inline `style=` except for dynamic values unavoidable with Tailwind
- Tailwind only for styling
- App name "TravelMe" stays English

## Report
Write your report to `docs/plans/task-1-report.md` with:
- status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- commits made
- test summary (did `npm run build` pass?)
- any concerns
