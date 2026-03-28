import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: { email: 'demo@example.com', password: hashed },
  });

  await prisma.transaction.createMany({
    data: [
      { description: "Salary", amount: 5000, type: "income", category: "salary", date: "2025-01-01", userId: user.id },
      { description: "Rent", amount: 1200, type: "expense", category: "housing", date: "2025-01-02", userId: user.id },
      { description: "Groceries", amount: 150, type: "expense", category: "food", date: "2025-01-03", userId: user.id },
      { description: "Freelance Work", amount: 800, type: "income", category: "salary", date: "2025-01-05", userId: user.id },
      { description: "Electric Bill", amount: 95, type: "expense", category: "utilities", date: "2025-01-06", userId: user.id },
      { description: "Dinner Out", amount: 65, type: "expense", category: "food", date: "2025-01-07", userId: user.id },
      { description: "Gas", amount: 45, type: "expense", category: "transport", date: "2025-01-08", userId: user.id },
      { description: "Netflix", amount: 15, type: "expense", category: "entertainment", date: "2025-01-10", userId: user.id },
    ],
  });

  console.log('Database seeded. Demo login: demo@example.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
