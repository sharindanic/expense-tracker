import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { requireAuth } from './middleware/auth.js';
import { createAuthRouter } from './routes/auth.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = 3000;

app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes (public)
app.use('/api/auth', authLimiter, createAuthRouter(prisma));

// GET /api/transactions
app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions
app.post('/api/transactions', requireAuth, async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;
    if (!description || !amount || !type || !category || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        category,
        date,
        userId: req.userId,
      },
    });
    res.status(201).json(transaction);
  } catch {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// PATCH /api/transactions/:id
app.patch('/api/transactions/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid transaction ID' });

    const transaction = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    const { description, amount, type, category, date } = req.body;
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(date !== undefined && { date }),
      },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid transaction ID' });

    const transaction = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    await prisma.transaction.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// GET /api/budgets
app.get('/api/budgets', requireAuth, async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({ where: { userId: req.userId } });
    res.json(budgets);
  } catch {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// POST /api/budgets — create or update
app.post('/api/budgets', requireAuth, async (req, res) => {
  try {
    const { category, amount } = req.body;
    if (!category || !amount) return res.status(400).json({ error: 'Category and amount required' });

    const budget = await prisma.budget.upsert({
      where: { userId_category: { userId: req.userId, category } },
      update: { amount: parseFloat(amount) },
      create: { category, amount: parseFloat(amount), userId: req.userId },
    });
    res.status(201).json(budget);
  } catch {
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// DELETE /api/budgets/:id
app.delete('/api/budgets/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid budget ID' });

    const budget = await prisma.budget.findFirst({ where: { id, userId: req.userId } });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    await prisma.budget.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
