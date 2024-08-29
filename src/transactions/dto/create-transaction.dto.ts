import {
  IsDate,
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

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
  @IsDateString({}, { message: 'dateTransaction must be a Date instance' })
  dateTransaction: Date;
}
