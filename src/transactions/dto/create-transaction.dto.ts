import {
  IsDate,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Prisma, TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  budgetId: string;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsNotEmpty()
  @IsDecimal({}, { message: 'amount must be a decimal number' })
  amount: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(TransactionType, {
    message: 'transactionType must be either INCOME or EXPENSE',
  })
  transactionType: TransactionType;

  @IsNotEmpty()
  @IsDateString({}, { message: 'dateTransaction must be a Date instance' })
  dateTransaction: Date;
}
