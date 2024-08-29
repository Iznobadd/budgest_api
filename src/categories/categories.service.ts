import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    try {
      const create = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          userId,
        },
      });

      return create;
    } catch (err) {
      throw new InternalServerErrorException('Internal server Error');
    }
  }

  async findAll(userId: string) {
    try {
      const findAll = await this.prisma.category.findMany({
        where: {
          userId,
        },
      });
      return findAll;
    } catch (err) {
      throw new InternalServerErrorException('Internal server Error');
    }
  }

  async remove(id: string) {
    try {
      const remove = await this.prisma.category.delete({
        where: {
          id,
        },
      });
      return remove;
    } catch (err) {
      throw new InternalServerErrorException('Internal server Error');
    }
  }
}
