import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private categorySerivce: CategoryService) {}
  @Get()
  async GetAllCategories() {
    return await this.categorySerivce.getAllCategories();
  }
}
