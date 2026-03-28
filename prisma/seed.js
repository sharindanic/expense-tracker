import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.transaction.deleteMany();

  await prisma.transaction.createMany({
    data: [
      { description: "Salary", amount: 5000, type: "income", category: "salary", date: "2025-01-01" },
      { description: "Rent", amount: 1200, type: "expense", category: "housing", date: "2025-01-02" },
      { description: "Groceries", amount: 150, type: "expense", category: "food", date: "2025-01-03" },
      { description: "Freelance Work", amount: 800, type: "income", category: "salary", date: "2025-01-05" },
      { description: "Electric Bill", amount: 95, type: "expense", category: "utilities", date: "2025-01-06" },
      { description: "Dinner Out", amount: 65, type: "expense", category: "food", date: "2025-01-07" },
      { description: "Gas", amount: 45, type: "expense", category: "transport", date: "2025-01-08" },
      { description: "Netflix", amount: 15, type: "expense", category: "entertainment", date: "2025-01-10" },
    ],
  });

  console.log('Database seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
