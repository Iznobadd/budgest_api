import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const amount = parseFloat(createTransactionDto.amount);

    const date_transaction = new Date(createTransactionDto.dateTransaction);

    if (isNaN(amount)) {
      throw new Error('Invalid amount');
    }

    if (isNaN(date_transaction.getTime())) {
      throw new Error('Invalid dateTransaction');
    }

    const budget = await this.prisma.budget.findUnique({
      where: {
        id: createTransactionDto.budgetId,
      },
    });

    if (!budget) throw new NotFoundException('Budget not found');

    const category = await this.prisma.category.findUnique({
      where: {
        id: createTransactionDto.categoryId,
      },
    });

    if (!category) throw new NotFoundException('Category not found');

    const newTransaction = await this.prisma.transaction.create({
      data: {
        budgetId: budget.id,
        categoryId: category.id,
        amount,
        description: createTransactionDto.description,
        transactionType: createTransactionDto.transactionType,
        date_transaction,
      },
    });

    return newTransaction;
  }

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (budgets.length === 0) throw new NotFoundException('Account not found');

    const budgetIds = budgets.map((budget) => budget.id);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        budgetId: { in: budgetIds },
      },
    });

    return transactions;
  }

  async findByBudget(budgetId: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: {
        id: budgetId,
      },
    });

    if (!budget) throw new NotFoundException('Budget not found');

    const transactions = await this.prisma.transaction.findMany({
      where: {
        budgetId,
      },
    });

    return transactions;
  }
}
