import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async find(userId: string, id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: {
        id,
      },
    });

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException(
        'Budget not found or does not belong to the user',
      );
    }

    return budget;
  }
  async remaining(userId: string, id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: {
        id,
      },
      include: {
        Transaction: true,
      },
    });

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException(
        'Budget not found or does not belong to the user',
      );
    }

    const { totalIncome, totalExpense } = budget.Transaction.reduce(
      (acc, transaction) => {
        if (transaction.transactionType === 'INCOME') {
          acc.totalIncome = acc.totalIncome.plus(transaction.amount);
        } else if (transaction.transactionType === 'EXPENSE') {
          acc.totalExpense = acc.totalExpense.plus(transaction.amount);
        }
        return acc;
      },
      {
        totalIncome: new Prisma.Decimal(0),
        totalExpense: new Prisma.Decimal(0),
      },
    );

    const remainingBudget = budget.amount.plus(totalIncome).minus(totalExpense);

    return remainingBudget.toFixed(2);
  }
}
