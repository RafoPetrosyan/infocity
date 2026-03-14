import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateSubCategoryDto,
  SubCategoryTranslationDto,
} from './dto/create-sub-category.dto';
import { SubCategory } from './models/sub-category.model';
import { SubCategoryTranslation } from './models/sub-category-translation.model';
import { Sequelize } from 'sequelize-typescript';
import { Place } from '../places/models/places.model';
import { Category } from './models/category.model';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectModel(SubCategory)
    private subCategoryModel: typeof SubCategory,

    @InjectModel(SubCategoryTranslation)
    private subCategoryTranslationModel: typeof SubCategoryTranslation,

    @InjectModel(Place)
    private placeModel: typeof Place,

    @InjectModel(Category)
    private categoryModel: typeof Category,

    private sequelize: Sequelize,
  ) {}

  async getAll(lang: string) {
    return await this.subCategoryModel.findAll({
      include: [
        {
          model: this.subCategoryTranslationModel,
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
      ],
      attributes: [
        'id',
        'slug',
        'icon',
        'category_id',
        [
          this.sequelize.fn('COUNT', this.sequelize.col('places.id')),
          'places_count',
        ],
        [Sequelize.col('translation.name'), 'name'],
      ],
      group: ['SubCategory.id', 'translation.id'],
      order: [['order', 'ASC']],
    });
  }

  async getAllAdmin(categoryId?: number) {
    return await this.subCategoryModel.findAll({
      where: categoryId ? { category_id: categoryId } : undefined,
      include: [
        {
          model: this.subCategoryTranslationModel,
          as: 'translations',
          attributes: ['name', 'language', 'id'],
        },
        {
          model: this.categoryModel,
          as: 'category',
          attributes: ['id', 'slug'],
          required: false,
        },
      ],
      order: [['order', 'ASC']],
    });
  }

  async create(
    dto: CreateSubCategoryDto,
    translations: SubCategoryTranslationDto[],
  ) {
    const existSlug = await this.subCategoryModel.findOne({
      where: { slug: dto.slug },
    });

    if (existSlug) {
      throw new BadRequestException({
        message: `Sub-category with slug ${dto.slug} already exists`,
      });
    }

    if (dto.category_id) {
      const category = await this.categoryModel.findByPk(dto.category_id);
      if (!category) {
        throw new BadRequestException({
          message: `Category with id ${dto.category_id} not found`,
        });
      }
    }

    const subCategory = await this.subCategoryModel.create({
      slug: dto.slug,
      icon: dto.icon || null,
      category_id: dto.category_id || null,
    });

    const translationsData = translations.map((t) => ({
      sub_category_id: subCategory.id,
      language: t.language,
      name: t.name,
    }));
    await this.subCategoryTranslationModel.bulkCreate(translationsData);

    return { message: 'Sub-category created successfully.' };
  }

  async update(
    id: number,
    dto: CreateSubCategoryDto,
    translations: SubCategoryTranslationDto[],
  ) {
    const subCategory = await this.subCategoryModel.findByPk(id, {
      include: [
        { model: this.subCategoryTranslationModel, as: 'translations' },
      ],
    });

    if (!subCategory) {
      throw new NotFoundException(`Sub-category with id ${id} not found`);
    }

    if (dto.category_id) {
      const category = await this.categoryModel.findByPk(dto.category_id);
      if (!category) {
        throw new BadRequestException({
          message: `Category with id ${dto.category_id} not found`,
        });
      }
    }

    await subCategory.update({
      slug: dto.slug,
      icon: dto.icon !== undefined ? dto.icon : subCategory.icon,
      category_id: dto.category_id ?? subCategory.category_id,
    });

    for (const t of translations) {
      const existing = await this.subCategoryTranslationModel.findOne({
        where: { sub_category_id: id, language: t.language },
      });

      if (existing) {
        await existing.update({ name: t.name });
      } else {
        await this.subCategoryTranslationModel.create({
          sub_category_id: id,
          language: t.language,
          name: t.name,
        });
      }
    }

    return { message: 'Sub-category updated successfully.' };
  }

  async updateOrdering(items: { id: number; order: number }[]) {
    const transaction = await this.sequelize.transaction();

    try {
      await Promise.all(
        items.map((item) =>
          this.subCategoryModel.update(
            { order: item.order },
            { where: { id: item.id }, transaction },
          ),
        ),
      );

      await transaction.commit();
      return { message: 'Sub-category reordered successfully.' };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async delete(id: number) {
    const subCategory = await this.subCategoryModel.findByPk(id);

    if (!subCategory) {
      throw new NotFoundException(`Sub-category with id ${id} not found`);
    }

    await subCategory.destroy();
    return { message: 'Sub-category deleted successfully' };
  }
}
