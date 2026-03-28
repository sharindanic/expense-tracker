import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { requireAuth } from './middleware/auth.js';
import { createAuthRouter } from './routes/auth.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = 3000;

app.use(express.json());

// Auth routes (public)
app.use('/api/auth', createAuthRouter(prisma));

// Transaction routes (protected)
app.get('/api/transactions', requireAuth, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
  });
  res.json(transactions);
});

app.post('/api/transactions', requireAuth, async (req, res) => {
  const { description, amount, type, category, date } = req.body;
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
});

app.delete('/api/transactions/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.transaction.delete({ where: { id, userId: req.userId } });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
