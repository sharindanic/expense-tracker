import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store (temporary until we add PostgreSQL in step 3)
let transactions = [
  { id: 1, description: "Salary", amount: 5000, type: "income", category: "salary", date: "2025-01-01" },
  { id: 2, description: "Rent", amount: 1200, type: "expense", category: "housing", date: "2025-01-02" },
  { id: 3, description: "Groceries", amount: 150, type: "expense", category: "food", date: "2025-01-03" },
  { id: 4, description: "Freelance Work", amount: 800, type: "income", category: "salary", date: "2025-01-05" },
  { id: 5, description: "Electric Bill", amount: 95, type: "expense", category: "utilities", date: "2025-01-06" },
  { id: 6, description: "Dinner Out", amount: 65, type: "expense", category: "food", date: "2025-01-07" },
  { id: 7, description: "Gas", amount: 45, type: "expense", category: "transport", date: "2025-01-08" },
  { id: 8, description: "Netflix", amount: 15, type: "expense", category: "entertainment", date: "2025-01-10" },
];

// GET /api/transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// POST /api/transactions
app.post('/api/transactions', (req, res) => {
  const { description, amount, type, category, date } = req.body;
  const transaction = {
    id: Date.now(),
    description,
    amount: parseFloat(amount),
    type,
    category,
    date,
  };
  transactions.push(transaction);
  res.status(201).json(transaction);
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  transactions = transactions.filter(t => t.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
