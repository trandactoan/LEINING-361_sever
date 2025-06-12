import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryResponseDto } from './dto/category_response.dto';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @InjectModel(Category.name) private CategoryModel: Model<CategoryDocument>,
  ) {
    super(CategoryModel);
  }
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.CategoryModel.find();
    return categories.map((result) => new CategoryResponseDto(result));
  }
}
