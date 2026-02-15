import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SubcategoriesService } from './subcategories.service';
import { SubcategoriesController } from './subcategories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { CategoryTranslation } from './models/category-translation.model';
import { SubCategory } from './models/sub-category.model';
import { SubCategoryTranslation } from './models/sub-category-translation.model';
import { Place } from '../places/models/places.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Category,
      CategoryTranslation,
      SubCategory,
      SubCategoryTranslation,
      Place,
    ]),
  ],
  providers: [CategoriesService, SubcategoriesService],
  controllers: [CategoriesController, SubcategoriesController],
})
export class CategoriesModule {}
