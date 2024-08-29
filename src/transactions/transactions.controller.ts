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

  @Get(':account')
  findOne(@Param('account') accountId: string, @GetUser() user: UserPayload) {
    return this.transactionsService.findByAccount(accountId, user.sub);
  }
}
