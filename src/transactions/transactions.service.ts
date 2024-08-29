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

    const account = await this.prisma.account.findUnique({
      where: {
        id: createTransactionDto.accountId,
      },
    });

    if (!account) throw new NotFoundException('Account not found');

    const category = await this.prisma.category.findUnique({
      where: {
        id: createTransactionDto.categoryId,
      },
    });

    if (!category) throw new NotFoundException('Category not found');

    const newTransaction = await this.prisma.transaction.create({
      data: {
        accountId: account.id,
        categoryId: category.id,
        amount,
        description: createTransactionDto.description,
        date_transaction,
      },
    });

    return newTransaction;
  }

  async findAll(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (accounts.length === 0) throw new NotFoundException('Account not found');

    const accountIds = accounts.map((account) => account.id);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
      },
    });

    return transactions;
  }

  async findByAccount(accountId: string, userId: string) {
    const account = await this.prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });

    if (!account) throw new NotFoundException('Account not found');

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId,
      },
    });

    return transactions;
  }
}
