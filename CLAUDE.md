# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start frontend + backend together
npm run client    # Frontend only (Vite) at http://localhost:5173
npm run server    # Backend only (Express) at http://localhost:3000
npm run build     # Production build
npm run lint      # Run ESLint
npm run db:migrate    # Run Prisma migrations
npm run db:generate   # Regenerate Prisma client
npm run db:reset      # Reset database (dev only)
npm run seed          # Seed database with sample data
npm test              # Run Playwright E2E tests
npm run test:ui       # Open Playwright UI
```

## Architecture

Full-stack app: React 19 frontend (Vite) + Express 5 backend + PostgreSQL via Prisma.

### Frontend (`src/`)

```
App.jsx
├── AuthPage.jsx
├── Sidebar.jsx
├── Summary.jsx
├── TransactionForm.jsx
├── TransactionList.jsx
├── BudgetManager.jsx
└── Analytics.jsx
```

**`App.jsx`** — root component. Holds `transactions`, `budgets`, and `user` state. All API calls live here and are passed down as handlers (`handleAdd`, `handleEdit`, `handleDelete`, `handleSaveBudget`, `handleDeleteBudget`). Manages `view` state (`'dashboard' | 'transactions' | 'budgets' | 'analytics'`) plus the shared `search` and `category` filters and the sidebar's `navCollapsed` flag — the last three live here because both the sidebar and `TransactionList` drive them.

**`Sidebar.jsx`** — fixed left navigation rail, modelled on DexScreener's. Brand + collapse toggle, a search box bound to `/`, a "New Transaction" action, the four view links (active row gets a left accent bar), a colour-dotted category list showing spend per category, a dockable balance panel, the account row, and a footer with the theme toggle and Logout. Collapses to a 64px icon rail (persisted in `localStorage` under `sidebar:collapsed`) and becomes an off-canvas drawer below `md`. Uses the existing `--sidebar-*` tokens, so it follows light/dark automatically.

Its "New Transaction" button is deliberately *not* labelled "Add Transaction": Playwright matches accessible names by substring, so that wording collides with the form's `Add` button in `getByRole('button', { name: 'Add' })`.

**`AuthPage.jsx`** — handles login, register, forgot password, and reset password. Uses a `view` state (`'auth' | 'forgot' | 'reset'`) to switch between the three screens. No email service — reset token is shown directly on screen; the forgot-password screen shows a live countdown to its 15-minute expiry. Server error strings are translated to Japanese via a local `ERROR_JA` map so the UI never mixes languages. Submit buttons disable and show a loading state while a request is in flight. Primary buttons (`TranslatedButton`) reveal their English word on hover, rendered as hand-built SVG strokes (`KANJI_LATIN_GLYPHS`/`KanjiLatin`) rather than a system font.

Styled with a **wabi-sabi (侘寂)** theme around the *kakeibo* (家計簿) idea: washi-paper background, sumi ink, and a single vermilion (朱) accent, with an ensō brush circle and a 記 hanko seal. All labels are Japanese. Design tokens (`--washi`, `--sumi`, `--shu`, grain, ensō, seal, brush-underline input) live under a `.wabi` class in `src/index.css` and are scoped so the rest of the app keeps the neutral shadcn theme. Fonts are Shippori Mincho + Noto Serif JP (self-hosted via fontsource). Supports light and dark (sumi-night) variants.

**`App.jsx`** also contains the change password dialog (state and handler live here). Opened via the gear button on the sidebar's account row.

**`Summary.jsx`** — computes and displays `totalIncome`, `totalExpenses`, `balance` from transactions.

**`TransactionForm.jsx`** — add transaction form with client-side validation. Shows inline error messages for empty description or invalid amount.

**`TransactionList.jsx`** — filterable, searchable, sortable table with edit (dialog) and delete (confirm dialog). Edit modal has client-side validation. Search filters by description in real time. Sort options: newest/oldest/highest/lowest amount. `search` and `filterCategory` are controlled by `App` (so the sidebar can drive them); `filterType` and `sortBy` stay local.

**`BudgetManager.jsx`** — set monthly budget limits per category. Shows progress bars with warning at 80% and over-budget state at 100%.

**`Analytics.jsx`** — three charts (spending by category donut, income vs expenses bar, balance over time line) plus CSV export and PNG download per chart.

### Backend (`server/`)

**`server/index.js`** — all API routes for transactions and budgets. Rate limiting applied to all `/api/auth/*` routes (20 requests per 15 minutes per IP via `express-rate-limit`).

**`server/routes/auth.js`** — register, login, forgot-password, reset-password, and change-password endpoints.

**`server/middleware/auth.js`** — JWT verification middleware (`requireAuth`).

### Database

Prisma with PostgreSQL. Three models: `User`, `Transaction`, `Budget`.

`User` has `resetToken` and `resetExpiry` fields for the password reset flow.

The `categories` constant is duplicated in `TransactionForm`, `TransactionList`, and `BudgetManager` — not yet extracted to a shared location.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/forgot-password` | No | Generate reset token (returned in response) |
| POST | `/api/auth/reset-password` | No | Reset password using token |
| POST | `/api/auth/change-password` | Yes | Change password while logged in |
| GET | `/api/transactions` | Yes | Get user's transactions |
| POST | `/api/transactions` | Yes | Add transaction |
| PATCH | `/api/transactions/:id` | Yes | Edit transaction |
| DELETE | `/api/transactions/:id` | Yes | Delete transaction |
| GET | `/api/budgets` | Yes | Get user's budgets |
| POST | `/api/budgets` | Yes | Create or update a budget |
| DELETE | `/api/budgets/:id` | Yes | Delete a budget |
