# Expense Tracker

A full-stack personal finance tracker. Track income and expenses, view a live balance summary, filter by category, and manage your data with a secure account.

## Screenshots

## ss will be added later 

## Tech Stack

**Frontend**
- React 19 + Vite 7
- Tailwind CSS v4
- shadcn/ui components
- Recharts (analytics charts)

**Backend**
- Node.js + Express 5
- PostgreSQL (via Docker)
- Prisma 7 ORM
- JWT authentication + bcrypt

**Testing**
- Playwright (E2E)

## Features

- Register and login with secure JWT authentication
- Forgot password flow with reset token (no email service required — see note below)
- Add, edit, and delete transactions with confirmation
- Client-side validation on all forms with inline error messages
- Live summary of income, expenses, and balance
- Filter transactions by type and category
- Monthly budget limits with progress bars and over-budget warnings
- Data persists in PostgreSQL database
- Analytics dashboard with spending by category (donut chart), income vs expenses by month (bar chart), and balance over time (line chart)
- Export transactions to CSV and charts to PNG

## Getting Started

### 1. Start the database

Make sure Docker Desktop is running, then:

```bash
docker compose up -d
```

### 2. Set up the database

```bash
npm install
npm run db:migrate    # Create tables
npm run seed          # Load sample data (optional)
```

Demo account after seeding: `demo@example.com` / `password123`

### 3. Run the app

```bash
npm run dev
```

Opens at `http://localhost:5173` (frontend) with API at `http://localhost:3000`.

## Available Scripts

```bash
npm run dev           # Start frontend + backend together
npm run client        # Frontend only (Vite)
npm run server        # Backend only (Express)
npm run build         # Production build
npm run lint          # Run ESLint
npm run seed          # Seed database with sample data
npm run db:migrate    # Run Prisma migrations
npm run db:generate   # Regenerate Prisma client
npm run db:reset      # Reset database (dev only)
npm test              # Run Playwright E2E tests
npm run test:ui       # Open Playwright UI
```

## Project Structure

```
├── server/
│   ├── index.js              # Express app and all API routes
│   ├── middleware/auth.js    # JWT verification middleware
│   └── routes/auth.js        # Register, login, forgot/reset password endpoints
├── prisma/
│   ├── schema.prisma         # User, Transaction, Budget models
│   ├── seed.js               # Sample data seeder
│   └── migrations/           # Database migrations
├── src/
│   ├── App.jsx               # Root component, auth state, API calls
│   ├── AuthPage.jsx          # Login, register, forgot password, reset password
│   ├── Summary.jsx           # Income / expense / balance cards
│   ├── TransactionForm.jsx   # Add transaction form with validation
│   ├── TransactionList.jsx   # Filterable transaction table with edit and delete
│   ├── BudgetManager.jsx     # Monthly budget limits and progress tracking
│   ├── Analytics.jsx         # Charts dashboard (recharts) + CSV/PNG export
│   └── components/ui/        # shadcn/ui components
├── tests/
│   ├── auth.spec.js          # Auth E2E tests
│   └── transactions.spec.js  # Transaction E2E tests
└── docker-compose.yml        # PostgreSQL container
```

## Password Reset (No Email Required)

Instead of sending a reset link by email, this app shows the reset token directly on screen. This is intentional — it keeps the project simple with zero external services or API keys needed.

Here's how it works:
1. Click **"Forgot password?"** on the login page and enter your email
2. A reset token appears on screen — copy it
3. Paste the token into the reset form along with your new password
4. Done — the token expires in 15 minutes and is deleted after use so it can't be reused

> In a real production app you would email this token to the user instead of showing it on screen.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/forgot-password` | No | Generate a password reset token |
| POST | `/api/auth/reset-password` | No | Reset password using token |
| GET | `/api/transactions` | Yes | Get user's transactions |
| POST | `/api/transactions` | Yes | Add transaction |
| PATCH | `/api/transactions/:id` | Yes | Edit transaction |
| DELETE | `/api/transactions/:id` | Yes | Delete transaction |
| GET | `/api/budgets` | Yes | Get user's budgets |
| POST | `/api/budgets` | Yes | Create or update a budget |
| DELETE | `/api/budgets/:id` | Yes | Delete a budget |
