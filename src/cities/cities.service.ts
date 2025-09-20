import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CityModel } from './models/city.model';
import { CityTranslation } from './models/city-translation.model';
import { CreateCityDto } from './dto/create-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(CityModel)
    private cityModel: typeof CityModel,

    @InjectModel(CityTranslation)
    private cityTranslationModel: typeof CityTranslation,

    private sequelize: Sequelize,
  ) {}

  async getAll(lang: string) {
    return await this.cityModel.findAll({
      include: [
        {
          model: this.cityTranslationModel,
          as: 'translation',
          where: { language: lang },
          required: true,
          attributes: [],
        },
      ],
      attributes: ['id', 'slug', [Sequelize.col('translation.name'), 'name']],
      order: [['order', 'ASC']],
    });
  }

  async getAllAdmin() {
    return await this.cityModel.findAll({
      include: [
        {
          model: this.cityTranslationModel,
          as: 'translations',
          attributes: ['name', 'language', 'id'],
        },
      ],
      order: [['order', 'ASC']],
    });
  }

  async create(dto: CreateCityDto) {
    const city = await this.cityModel.create({
      slug: dto.slug,
    });

    const translations = dto.translations.map((t) => ({
      city_id: city.id,
      language: t.language,
      name: t.name,
    }));
    await this.cityTranslationModel.bulkCreate(translations);

    return { message: 'City created successfully.' };
  }

  async update(id: number, dto: CreateCityDto) {
    // 1) find emotion
    const city = await this.cityModel.findByPk(id, {
      include: [{ model: this.cityTranslationModel, as: 'translations' }],
    });
    if (!city) {
      throw new NotFoundException(`City with id ${id} not found`);
    }

    // 2) update base fields
    await city.update({
      slug: dto.slug,
    });

    // 3) update/create translations
    for (const t of dto.translations) {
      const existing = await this.cityTranslationModel.findOne({
        where: { city_id: id, language: t.language },
      });

      if (existing) {
        await existing.update({ name: t.name });
      } else {
        await this.cityTranslationModel.create({
          city_id: id,
          language: t.language,
          name: t.name,
        });
      }
    }

    return { message: 'City updated successfully.' };
  }

  async updateOrdering(items: { id: number; order: number }[]) {
    const transaction = await this.sequelize.transaction();

    try {
      await Promise.all(
        items.map((item) =>
          this.cityModel.update(
            { order: item.order },
            { where: { id: item.id }, transaction },
          ),
        ),
      );

      await transaction.commit();
      return { message: 'City reordered successfully.' };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async delete(id: number) {
    // First delete translations (if not CASCADE)
    await this.cityTranslationModel.destroy({
      where: { city_id: id },
    });

    // Then delete the main emotion
    const deleted = await this.cityModel.destroy({
      where: { id },
    });

    if (!deleted) {
      throw new NotFoundException(`City with id ${id} not found`);
    }

    return { message: 'City deleted successfully' };
  }
}
