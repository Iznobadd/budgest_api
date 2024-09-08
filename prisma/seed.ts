import { PrismaClient, TransactionType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const password = 'marshall';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      password: hashedPassword,
    },
  });

  const category1 = await prisma.category.create({
    data: {
      name: faker.commerce.department(),
      userId: user.id,
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: faker.commerce.department(),
      userId: user.id,
    },
  });

  const budget = await prisma.budget.create({
    data: {
      amount: faker.number.bigInt({ min: 100, max: 5000 }).toString(),
      userId: user.id,
    },
  });

  const transactionsData = Array.from({ length: 10 }, () => ({
    amount: faker.number.bigInt({ min: 100, max: 5000 }).toString(),
    description: faker.lorem.sentence(),
    transactionType: faker.helpers.arrayElement([
      TransactionType.INCOME,
      TransactionType.EXPENSE,
    ]), // Randomly pick income or expense
    date_transaction: faker.date.past(),
    budgetId: budget.id,
    categoryId: faker.helpers.arrayElement([category1.id, category2.id]), // Randomly assign one of the categories
  }));

  await prisma.transaction.createMany({
    data: transactionsData,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect;
  });
