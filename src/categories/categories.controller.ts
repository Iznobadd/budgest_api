import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/decorators';
import { UserPayload } from 'src/types';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() user: UserPayload,
  ) {
    const create = await this.categoriesService.create(
      createCategoryDto,
      user.sub,
    );
    return create;
  }

  @Get()
  async findAll(@GetUser() user: UserPayload) {
    const findAll = await this.categoriesService.findAll(user.sub);
    return findAll;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
