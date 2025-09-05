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
import { Sequelize } from 'sequelize-typescript';
import { unlink } from 'fs/promises';
import { Place } from '../places/models/places.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,

    @InjectModel(CategoryTranslation)
    private categoryTranslationModel: typeof CategoryTranslation,

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
          attributes: ['name'],
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
        'image',
        [
          this.sequelize.fn('COUNT', this.sequelize.col('places.id')),
          'places_count',
        ],
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
    image?: string,
    pathname?: string,
  ) {
    const existSlug = await this.categoryModel.findOne({
      where: { slug: dto.slug },
    });

    if (existSlug) {
      if (pathname) await unlink(pathname);
      throw new BadRequestException({
        message: `Category with slug ${dto.slug} already exists`,
      });
    }

    const category = await this.categoryModel.create({
      slug: dto.slug,
      image: image || null,
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
    image?: string,
    pathname?: string,
  ) {
    const category = await this.categoryModel.findByPk(id, {
      include: [{ model: this.categoryTranslationModel, as: 'translations' }],
    });

    if (!category) {
      if (pathname) await unlink(pathname);
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    if (image && category.dataValues.image) {
      await unlink(`uploads/categories/${category.dataValues.image}`);
    }

    await category.update({
      slug: dto.slug,
      image: image || category.image,
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

    if (category.dataValues.image) {
      await unlink(`uploads/categories/${category.dataValues.image}`);
    }

    await category.destroy();
    return { message: 'Category deleted successfully' };
  }
}
