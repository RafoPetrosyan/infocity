import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CategoryTranslationDto,
  CreateCategoryDto,
} from './dto/create-category.dto';
import { Category } from './models/category.model';
import { CategoryTranslation } from './models/category-translation.model';
import { SubCategory } from './models/sub-category.model';
import { SubCategoryTranslation } from './models/sub-category-translation.model';
import { Sequelize } from 'sequelize-typescript';
import { Place } from '../places/models/places.model';

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

    @InjectModel(Place)
    private placeModel: typeof Place,

    private sequelize: Sequelize,
  ) {}

  async getAll(lang: string) {
    return await this.categoryModel.findAll({
      include: [
        {
          model: this.categoryTranslationModel,
          as: 'translation',
          where: { language: lang },
          required: true,
          attributes: [],
        },
        {
          model: this.placeModel,
          as: 'places',
          attributes: [],
        },
        {
          model: this.subCategoryModel,
          as: 'sub_categories',
          required: false,
          separate: true,
          order: [['order', 'ASC']],
          include: [
            {
              model: this.subCategoryTranslationModel,
              as: 'translation',
              where: { language: lang },
              required: true,
              attributes: [],
            },
          ],
          attributes: [
            'id',
            'slug',
            'icon',
            'order',
            [Sequelize.col('translation.name'), 'name'],
          ],
        },
      ],
      attributes: [
        'id',
        'slug',
        'icon',
        [
          this.sequelize.fn('COUNT', this.sequelize.col('places.id')),
          'places_count',
        ],
        [Sequelize.col('translation.name'), 'name'],
      ],
      group: ['Category.id', 'translation.id'],
      order: [['order', 'ASC']],
    });
  }

  async getAllAdmin() {
    return await this.categoryModel.findAll({
      include: [
        {
          model: this.categoryTranslationModel,
          as: 'translations',
          attributes: ['name', 'language', 'id'],
        },
      ],
      order: [['order', 'ASC']],
    });
  }

  async create(
    dto: CreateCategoryDto,
    translations: CategoryTranslationDto[],
  ) {
    const existSlug = await this.categoryModel.findOne({
      where: { slug: dto.slug },
    });

    if (existSlug) {
      throw new BadRequestException({
        message: `Category with slug ${dto.slug} already exists`,
      });
    }

    const category = await this.categoryModel.create({
      slug: dto.slug,
      icon: dto.icon || null,
    });

    const translationsData = translations.map((t) => ({
      category_id: category.id,
      language: t.language,
      name: t.name,
    }));
    await this.categoryTranslationModel.bulkCreate(translationsData);

    return { message: 'Category created successfully.' };
  }

  async update(
    id: number,
    dto: CreateCategoryDto,
    translations: CategoryTranslationDto[],
  ) {
    const category = await this.categoryModel.findByPk(id, {
      include: [{ model: this.categoryTranslationModel, as: 'translations' }],
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    await category.update({
      slug: dto.slug,
      icon: dto.icon !== undefined ? dto.icon : category.icon,
    });

    for (const t of translations) {
      const existing = await this.categoryTranslationModel.findOne({
        where: { category_id: id, language: t.language },
      });

      if (existing) {
        await existing.update({ name: t.name });
      } else {
        await this.categoryTranslationModel.create({
          category_id: id,
          language: t.language,
          name: t.name,
        });
      }
    }

    return { message: 'Category updated successfully.' };
  }

  async updateOrdering(items: { id: number; order: number }[]) {
    const transaction = await this.sequelize.transaction();

    try {
      await Promise.all(
        items.map((item) =>
          this.categoryModel.update(
            { order: item.order },
            { where: { id: item.id }, transaction },
          ),
        ),
      );

      await transaction.commit();
      return { message: 'Category reordered successfully.' };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async delete(id: number) {
    const category = await this.categoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    await category.destroy();
    return { message: 'Category deleted successfully' };
  }
}
