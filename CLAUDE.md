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

Single-page React 19 app built with Vite, split into four components:

```
App.jsx
├── Summary.jsx
├── TransactionForm.jsx
└── TransactionList.jsx
```

**`App.jsx`** — holds `transactions` state (array of `{ id, description, amount, type, category, date }`) and passes it down. Only entry point for mutating the list via `handleAdd`.

**`Summary.jsx`** — receives `transactions`, computes `totalIncome`, `totalExpenses`, and `balance` internally.

**`TransactionForm.jsx`** — owns all form state (`description`, `amount`, `type`, `category`). Calls `onAdd(transaction)` prop on submit.

**`TransactionList.jsx`** — receives `transactions`, owns filter state (`filterType`, `filterCategory`) internally.

The `categories` constant is duplicated in `TransactionForm` and `TransactionList` — not yet extracted to a shared location.

**Data flow:** client-side only, no backend, no persistence — data resets on refresh.

**Styling:** plain CSS in `src/App.css` (scoped) and `src/index.css` (global reset).

## Known Issues (intentional — this is a course starter)

- Delete button has CSS (`.delete-btn`) but no implementation
- No input validation or error handling
