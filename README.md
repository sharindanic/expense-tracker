# Expense Tracker

A personal finance tracker built with React and Vite. Track your income and expenses, view a live balance summary, filter transactions by type and category, and delete entries with a confirmation prompt.

## Tech Stack

- **React 19** — UI and state management
- **Vite 7** — dev server and build tool
- **Plain CSS** — no UI frameworks

## Features

- Add income and expense transactions with description, amount, type, and category
- Live summary showing total income, total expenses, and balance
- Filter transactions by type (income/expense) and category
- Delete transactions with a confirmation dialog

## Getting Started

```bash
npm install
npm run dev
```

Then open your browser at `http://localhost:5173`.

## Available Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Project Structure

```
src/
├── App.jsx             # Root component, holds transactions state
├── Summary.jsx         # Displays income, expenses, and balance totals
├── TransactionForm.jsx # Form to add new transactions
├── TransactionList.jsx # Filterable table of transactions with delete
├── App.css             # Component styles
└── index.css           # Global reset
```

> Frontend only — no backend or database. Data resets on page refresh.
