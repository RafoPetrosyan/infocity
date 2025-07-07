import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProvinceModel } from './models/province.model';
import { ProvinceTranslation } from './models/province-translation.model';
import { CityModel } from './models/city.model';
import { col, Sequelize } from 'sequelize';
import { CityTranslation } from './models/city-translation.model';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectModel(ProvinceModel)
    private provinceModel: typeof ProvinceModel,

    @InjectModel(ProvinceTranslation)
    private provinceTranslationModel: typeof ProvinceTranslation,

    @InjectModel(CityModel)
    private cityModel: typeof CityModel,

    @InjectModel(CityTranslation)
    private cityTranslationModel: typeof CityTranslation,
  ) {}

  async getAll(lang: string) {
    return await this.provinceModel.findAll({
      include: [
        {
          model: this.provinceTranslationModel,
          as: 'translations',
          attributes: [],
          where: { language: lang },
          required: true,
        },
        {
          model: this.cityModel,
          as: 'cities',
          separate: true,
          attributes: [
            'id',
            'slug',
            'province_id',
            [Sequelize.col('translations.name'), 'name'],
          ],
          include: [
            {
              model: this.cityTranslationModel,
              as: 'translations',
              attributes: [],
              where: { language: lang },
              required: true,
              subQuery: false,
              duplicating: false,
            },
          ],
        },
      ],
      attributes: ['id', 'slug', [col('translations.name'), 'name']],
    });
  }

  async getAllCities(
    lang: string,
    pagination: { page?: number; limit?: number },
  ) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.cityModel.findAndCountAll({
      attributes: [
        'id',
        'slug',
        [Sequelize.col('translations.name'), 'name'],
        [Sequelize.col('province.translations.name'), 'province.name'],
      ],
      include: [
        {
          model: this.cityTranslationModel,
          as: 'translations',
          attributes: [],
          where: { language: lang },
          required: true,
        },
        {
          model: this.provinceModel,
          as: 'province',
          attributes: [
            'id',
            'slug',
            // [Sequelize.col('translations.name'), 'name'],
          ],
          include: [
            {
              model: this.provinceTranslationModel,
              as: 'translations',
              attributes: [],
              where: { language: lang },
              required: true,
            },
          ],
        },
      ],
      nest: true,
      raw: true,
    });

    return {
      cities: rows,
      meta: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }
}
