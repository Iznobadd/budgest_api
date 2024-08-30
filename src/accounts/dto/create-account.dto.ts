import { IsDecimal, IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDecimal({}, { message: 'budget must be a decimal number' })
  budget: string;
}
