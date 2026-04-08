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
├── Summary.jsx
├── TransactionForm.jsx
├── TransactionList.jsx
├── BudgetManager.jsx
└── Analytics.jsx
```

**`App.jsx`** — root component. Holds `transactions`, `budgets`, and `user` state. All API calls live here and are passed down as handlers (`handleAdd`, `handleEdit`, `handleDelete`, `handleSaveBudget`, `handleDeleteBudget`). Manages `view` state to switch between dashboard and analytics.

**`AuthPage.jsx`** — handles login, register, forgot password, and reset password. Uses a `view` state (`'auth' | 'forgot' | 'reset'`) to switch between the three screens. No email service — reset token is shown directly on screen and expires in 15 minutes.

**`Summary.jsx`** — computes and displays `totalIncome`, `totalExpenses`, `balance` from transactions.

**`TransactionForm.jsx`** — add transaction form with client-side validation. Shows inline error messages for empty description or invalid amount.

**`TransactionList.jsx`** — filterable table with edit (dialog) and delete (confirm dialog). Edit modal has client-side validation.

**`BudgetManager.jsx`** — set monthly budget limits per category. Shows progress bars with warning at 80% and over-budget state at 100%.

**`Analytics.jsx`** — three charts (spending by category donut, income vs expenses bar, balance over time line) plus CSV export and PNG download per chart.

### Backend (`server/`)

**`server/index.js`** — all API routes for transactions and budgets.

**`server/routes/auth.js`** — register, login, forgot-password, reset-password endpoints.

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
| GET | `/api/transactions` | Yes | Get user's transactions |
| POST | `/api/transactions` | Yes | Add transaction |
| PATCH | `/api/transactions/:id` | Yes | Edit transaction |
| DELETE | `/api/transactions/:id` | Yes | Delete transaction |
| GET | `/api/budgets` | Yes | Get user's budgets |
| POST | `/api/budgets` | Yes | Create or update a budget |
| DELETE | `/api/budgets/:id` | Yes | Delete a budget |
