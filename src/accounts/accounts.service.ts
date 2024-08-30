import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(createAccountDto: CreateAccountDto, userId: string) {
    try {
      const create = await this.prisma.account.create({
        data: {
          userId,
          name: createAccountDto.name,
        },
      });
      return create;
    } catch (err) {
      throw new InternalServerErrorException('Internal server Error');
    }
  }

  async findAll(userId: string) {
    try {
      const findAll = await this.prisma.account.findMany({
        where: {
          userId,
        },
      });
      return findAll;
    } catch (err) {
      throw new InternalServerErrorException('Internal server Error');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
