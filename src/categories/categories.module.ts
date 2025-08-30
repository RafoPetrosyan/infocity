import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { CategoryTranslation } from './models/category-translation.model';

@Module({
  imports: [SequelizeModule.forFeature([Category, CategoryTranslation])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
