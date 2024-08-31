import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetUser } from 'src/decorators';
import { UserPayload } from 'src/types';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll(@GetUser() user: UserPayload) {
    return this.transactionsService.findAll(user.sub);
  }

  @Get(':budget')
  findOne(@Param('budget') budgetId: string, @GetUser() user: UserPayload) {
    return this.transactionsService.findByBudget(budgetId, user.sub);
  }
}
