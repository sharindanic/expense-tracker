# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

No test runner is configured.

## Architecture

Single-page React 19 app built with Vite. All logic lives in one component: `src/App.jsx`.

**State** (all in `App.jsx` via `useState`):
- `transactions` — array of `{ id, description, amount, type, category, date }`
- Form inputs: `description`, `amount`, `type`, `category`
- Filters: `filterType`, `filterCategory`

**Data flow:** client-side only, no backend, no persistence — data resets on refresh.

**Styling:** plain CSS in `src/App.css` (scoped) and `src/index.css` (global reset).

## Known Issues (intentional — this is a course starter)

- `amount` values are stored as strings but used as numbers in calculations (causes incorrect totals)
- Delete button has CSS (`.delete-btn`) but no implementation
- No input validation or error handling
- All code is in a single `App.jsx` with no component extraction
