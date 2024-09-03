import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/decorators';
import { User } from '@prisma/client';
import { UserPayload } from 'src/types';

@UseGuards(AuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get('/find/:budgetId')
  async find(
    @GetUser() user: UserPayload,
    @Param('budgetId') budgetId: string,
  ) {
    const budget = await this.budgetsService.find(user.sub, budgetId);

    return budget;
  }

  @Get('/remaining')
  async remaining(@GetUser() user: UserPayload) {
    const remainingBudget = await this.budgetsService.remaining(user.sub);
    return remainingBudget;
  }
}
