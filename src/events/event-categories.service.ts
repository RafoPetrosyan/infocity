import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventCategory } from './models/event-category.model';
import { EventCategoryTranslation } from './models/event-category-translation.model';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventCategoryDto } from './dto/update-event-category.dto';
import { Sequelize } from 'sequelize-typescript';
import { unlink } from 'fs/promises';
import { LanguageEnum } from '../../types';

@Injectable()
export class EventCategoriesService {
  constructor(
    @InjectModel(EventCategory)
    private eventCategoryModel: typeof EventCategory,

    @InjectModel(EventCategoryTranslation)
    private eventCategoryTranslationModel: typeof EventCategoryTranslation,

    private sequelize: Sequelize,
  ) {}

  async getAll(lang: LanguageEnum) {
    return await this.eventCategoryModel.findAll({
      include: [
        {
          model: this.eventCategoryTranslationModel,
          as: 'translation',
          where: { language: lang },
          required: true,
          attributes: [],
        },
      ],
      attributes: [
        'id',
        'slug',
        'order',
        [Sequelize.col('translation.name'), 'name'],
      ],
      order: [['order', 'ASC']],
    });
  }

  async getAllAdmin() {
    return await this.eventCategoryModel.findAll({
      include: [
        {
          model: this.eventCategoryTranslationModel,
          as: 'translations',
          attributes: ['name', 'language', 'id'],
        },
      ],
      order: [['order', 'ASC']],
    });
  }

  async getById(id: number, lang: LanguageEnum) {
    const category = await this.eventCategoryModel.findByPk(id, {
      attributes: [
        'id',
        'slug',
        'image',
        'order',
        'is_active',
        [Sequelize.col('translation.name'), 'name'],
      ],
      include: [
        {
          model: this.eventCategoryTranslationModel,
          as: 'translation',
          attributes: [],
          where: { language: lang },
        },
      ],
    });

    if (!category) {
      throw new NotFoundException('Event category not found');
    }

    return category;
  }

  async create(dto: CreateEventCategoryDto) {
    const slug = dto.en.name.toLowerCase().replace(/\s+/g, '-');
    const existSlug = await this.eventCategoryModel.findOne({
      where: { slug },
    });

    if (existSlug) {
      throw new BadRequestException(
        `Event category with slug ${slug} already exists`,
      );
    }

    const category = await this.eventCategoryModel.create({
      slug,
      order: dto.order || 0,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    });

    const languages = [
      {
        language: 'en',
        name: dto.en.name,
        description: dto.en.description || '',
        event_category_id: category.id,
      },
      {
        language: 'hy',
        name: dto.hy.name,
        description: dto.hy.description || '',
        event_category_id: category.id,
      },
      {
        language: 'ru',
        name: dto.ru.name,
        description: dto.ru.description || '',
        event_category_id: category.id,
      },
    ];
    await this.eventCategoryTranslationModel.bulkCreate(languages);

    return { message: 'Event category created successfully.' };
  }

  async update(id: number, dto: UpdateEventCategoryDto) {
    const category = await this.eventCategoryModel.findByPk(id, {
      attributes: ['id'],
    });

    if (!category) {
      throw new NotFoundException(`Event category with id ${id} not found`);
    }

    const updateData: any = {};

    if (dto.order !== undefined) updateData.order = dto.order;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    await this.eventCategoryModel.update(updateData, {
      where: { id },
    });

    if (dto.en) {
      const data = {
        name: dto.en.name,
      };
      await this.eventCategoryTranslationModel.update(data, {
        where: { event_category_id: id, language: 'en' },
      });
    }

    if (dto.hy) {
      const data = {
        name: dto.hy.name,
      };
      await this.eventCategoryTranslationModel.update(data, {
        where: { event_category_id: id, language: 'hy' },
      });
    }

    if (dto.ru) {
      const data = {
        name: dto.ru.name,
      };
      await this.eventCategoryTranslationModel.update(data, {
        where: { event_category_id: id, language: 'ru' },
      });
    }

    return { message: 'Event category updated successfully.' };
  }

  async updateOrdering(items: { id: number; order: number }[]) {
    const transaction = await this.sequelize.transaction();

    try {
      await Promise.all(
        items.map((item) =>
          this.eventCategoryModel.update(
            { order: item.order },
            { where: { id: item.id }, transaction },
          ),
        ),
      );

      await transaction.commit();
      return { message: 'Event category reordered successfully.' };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async delete(id: number) {
    const category = await this.eventCategoryModel.findByPk(id);

    if (!category) {
      throw new NotFoundException(`Event category with id ${id} not found`);
    }

    if (category.dataValues.image) {
      await unlink(`uploads/event-categories/${category.dataValues.image}`);
    }

    await category.destroy();
    return { message: 'Event category deleted successfully' };
  }
}
