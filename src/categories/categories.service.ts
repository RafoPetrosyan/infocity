import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './models/category.model';
import { CategoryTranslation } from './models/category-translation.model';
import { SubCategory } from './models/sub-category.model';
import { SubCategoryTranslation } from './models/sub-category-translation.model';
import { col, Sequelize } from 'sequelize';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,

    @InjectModel(CategoryTranslation)
    private categoryTranslationModel: typeof CategoryTranslation,

    @InjectModel(SubCategory)
    private subCategoryModel: typeof SubCategory,

    @InjectModel(SubCategoryTranslation)
    private subCategoryTranslationModel: typeof SubCategoryTranslation,
  ) {}

  async getAll(lang: string) {
    const categories = await this.categoryModel.findAll({
      include: [
        {
          model: this.categoryTranslationModel,
          as: 'translation',
          attributes: ['title'],
          where: { language: lang },
          required: true,
        },
        // {
        //   model: this.subCategoryModel,
        //   as: 'sub_categories',
        //   separate: true,
        //   attributes: [
        //     'id',
        //     'slug',
        //     'category_id',
        //     [Sequelize.col('translations.title'), 'title'],
        //   ],
        //   include: [
        //     {
        //       model: this.subCategoryTranslationModel,
        //       as: 'translations',
        //       attributes: [],
        //       where: { language: lang },
        //       required: true,
        //       subQuery: false,
        //       duplicating: false,
        //     },
        //   ],
        // },
      ],
      // attributes: ['id', 'slug', [col('translations.title'), 'title']],
    });

    return categories;
  }

  async create(dto: CreateCategoryDto) {
    const categoryExist = await this.categoryModel.findOne({
      where: { slug: dto.slug },
    });

    if (categoryExist) {
      throw new ConflictException('validation.category_slug_exists');
    }

    if (dto.sub_categories) {
      for (const sub of dto.sub_categories) {
        const subCategoryExist = await this.subCategoryModel.findOne({
          where: { slug: sub.slug },
        });

        if (subCategoryExist) {
          throw new ConflictException({
            key: 'validation.sub_category_slug_exists',
            args: { slug: dto.slug },
          });
        }
      }
    }

    const category = await this.categoryModel.create({
      slug: dto.slug,
    });

    for (const t of dto.translations) {
      await this.categoryTranslationModel.create({
        ...t,
        category_id: category.id,
      });
    }

    for (const sub of dto.sub_categories) {
      const subCategory = await this.subCategoryModel.create({
        slug: sub.slug,
        category_id: category.id,
      });

      for (const subT of sub.translations) {
        await this.subCategoryTranslationModel.create({
          ...subT,
          sub_category_id: subCategory.id,
        });
      }
    }

    return { success: true, id: category.id };
  }
}
