# Expense Tracker

A full-stack personal finance tracker. Track income and expenses, view a live balance summary, filter by category, and manage your data with a secure account.

## Tech Stack

**Frontend**
- React 19 + Vite 7
- Tailwind CSS v4
- shadcn/ui components

**Backend**
- Node.js + Express 5
- PostgreSQL (via Docker)
- Prisma 7 ORM
- JWT authentication + bcrypt

**Testing**
- Playwright (E2E)

## Features

- Register and login with secure JWT authentication
- Add income and expense transactions
- Live summary of income, expenses, and balance
- Filter transactions by type and category
- Delete transactions with confirmation
- Data persists in PostgreSQL database

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
│   ├── index.js              # Express app and routes
│   ├── middleware/auth.js    # JWT verification middleware
│   └── routes/auth.js        # Register and login endpoints
├── prisma/
│   ├── schema.prisma         # User and Transaction models
│   ├── seed.js               # Sample data seeder
│   └── migrations/           # Database migrations
├── src/
│   ├── App.jsx               # Root component, auth state, API calls
│   ├── AuthPage.jsx          # Login and register page
│   ├── Summary.jsx           # Income / expense / balance cards
│   ├── TransactionForm.jsx   # Add transaction form
│   ├── TransactionList.jsx   # Filterable transaction table
│   └── components/ui/        # shadcn/ui components
├── tests/
│   ├── auth.spec.js          # Auth E2E tests
│   └── transactions.spec.js  # Transaction E2E tests
└── docker-compose.yml        # PostgreSQL container
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/transactions` | Yes | Get user's transactions |
| POST | `/api/transactions` | Yes | Add transaction |
| DELETE | `/api/transactions/:id` | Yes | Delete transaction |
