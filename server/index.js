import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = 3000;

app.use(express.json());

// GET /api/transactions
app.get('/api/transactions', async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
  res.json(transactions);
});

// POST /api/transactions
app.post('/api/transactions', async (req, res) => {
  const { description, amount, type, category, date } = req.body;
  const transaction = await prisma.transaction.create({
    data: {
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    },
  });
  res.status(201).json(transaction);
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
