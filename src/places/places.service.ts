import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Place } from './models/places.model';
import { PlaceTranslation } from './models/places-translation.model';
import { Sequelize } from 'sequelize-typescript';
import { unlink } from 'fs/promises';
import { CreatePlaceDto, PlaceTranslationDto } from './dto/create-place.dto';
import slugify from 'slugify';
import { CityModel } from '../cities/models/city.model';
import { Category } from '../categories/models/category.model';
import { unlinkFiles } from '../../utils/unlink-files';

@Injectable()
export class PlacesService {
  constructor(
    @InjectModel(Place)
    private placeModel: typeof Place,

    @InjectModel(PlaceTranslation)
    private placeTranslationModel: typeof PlaceTranslation,

    @InjectModel(CityModel)
    private cityModel: typeof CityModel,

    @InjectModel(Category)
    private categoryModel: typeof Category,

    private sequelize: Sequelize,
  ) {}

  // async getAll(lang: string) {
  //   return await this.categoryModel.findAll({
  //     include: [
  //       {
  //         model: this.categoryTranslationModel,
  //         as: 'translation',
  //         where: { language: lang },
  //         required: true,
  //         attributes: ['name'],
  //       },
  //     ],
  //     attributes: ['id', 'slug', 'image'],
  //     order: [['order', 'ASC']],
  //   });
  // }
  //
  // async getAllAdmin() {
  //   return await this.categoryModel.findAll({
  //     include: [
  //       {
  //         model: this.categoryTranslationModel,
  //         as: 'translations',
  //         attributes: ['name', 'language', 'id'],
  //       },
  //     ],
  //     order: [['order', 'ASC']],
  //   });
  // }
  //
  async create(
    dto: CreatePlaceDto,
    files: {
      coverOriginalName: string | undefined;
      coverOriginalPath: string | undefined;
      coverThumbName: string | undefined;
      coverThumbPath: string | undefined;
      logoFileName: string | undefined;
      logoFilePath: string | undefined;
    },
  ) {
    if (!files.coverOriginalName) {
      if (files.logoFilePath) await unlink(files.logoFilePath);
      throw new NotFoundException(`Cover image is required`);
    }

    const city = await this.cityModel.findByPk(dto.city_id, {
      attributes: ['id'],
    });
    if (!city) {
      await unlinkFiles([
        files.logoFilePath,
        files.coverOriginalPath,
        files.coverThumbPath,
      ]);
      throw new NotFoundException(`City does not exist`);
    }

    const category = await this.categoryModel.findByPk(dto.category_id, {
      attributes: ['id'],
    });
    if (!category) {
      await unlinkFiles([
        files.logoFilePath,
        files.coverOriginalPath,
        files.coverThumbPath,
      ]);
      throw new NotFoundException(`Category does not exist`);
    }

    let baseSlug = slugify(dto.en.name, { lower: true, strict: true });
    const existBaseSlug = await this.placeModel.findOne({
      where: { slug: baseSlug },
      attributes: ['id'],
    });

    const placeData: any = {
      slug: existBaseSlug ? Date.now().toString() + '-' + baseSlug : baseSlug,
      image: files.coverThumbName,
      image_original: files.coverOriginalName,
      city_id: city.id,
      category_id: category.id,
      email: dto.email || null,
      phone_number: dto.phone_number || null,
      longitude: dto.longitude || null,
      latitude: dto.latitude || null,
      social_links: dto.social_links || [],
    };

    if (files.logoFileName) placeData.logo = files.logoFileName;

    if (dto.latitude && dto.longitude) {
      placeData.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    const place = await this.placeModel.create(placeData);
    if (existBaseSlug) {
      const finalSlug = `${baseSlug}-${place.id}`;
      await place.update({ slug: finalSlug });
    }

    const languages = [
      {
        language: 'en',
        name: dto.en.name,
        description: dto.en.description || '',
        about: dto.en.about || '',
        place_id: place.id,
      },
      {
        language: 'hy',
        name: dto.hy.name,
        description: dto.hy.description || '',
        about: dto.hy.about || '',
        place_id: place.id,
      },
      {
        language: 'ru',
        name: dto.ru.name,
        description: dto.ru.description || '',
        about: dto.ru.about || '',
        place_id: place.id,
      },
    ];
    await this.placeTranslationModel.bulkCreate(languages);

    // const translationsData = translations.map((t) => ({
    //   category_id: category.id,
    //   language: t.language,
    //   name: t.name,
    // }));
    // await this.placeTranslationModel.bulkCreate(translationsData);

    return { message: 'Place created successfully.', place };
  }

  // async update(
  //   id: number,
  //   dto: CreatePlaceDto,
  //   translations: CategoryTranslationDto[],
  //   image?: string,
  //   pathname?: string,
  // ) {
  //   const category = await this.categoryModel.findByPk(id, {
  //     include: [{ model: this.categoryTranslationModel, as: 'translations' }],
  //   });
  //
  //   if (!category) {
  //     if (pathname) await unlink(pathname);
  //     throw new NotFoundException(`Category with id ${id} not found`);
  //   }
  //
  //   if (image && category.dataValues.image) {
  //     await unlink(`uploads/categories/${category.dataValues.image}`);
  //   }
  //
  //   await category.update({
  //     slug: dto.slug,
  //     image: image || category.image,
  //   });
  //
  //   for (const t of translations) {
  //     const existing = await this.categoryTranslationModel.findOne({
  //       where: { category_id: id, language: t.language },
  //     });
  //
  //     if (existing) {
  //       await existing.update({ name: t.name });
  //     } else {
  //       await this.categoryTranslationModel.create({
  //         category_id: id,
  //         language: t.language,
  //         name: t.name,
  //       });
  //     }
  //   }
  //
  //   return { message: 'Category updated successfully.' };
  // }
  //
  // async updateOrdering(items: { id: number; order: number }[]) {
  //   const transaction = await this.sequelize.transaction();
  //
  //   try {
  //     await Promise.all(
  //       items.map((item) =>
  //         this.categoryModel.update(
  //           { order: item.order },
  //           { where: { id: item.id }, transaction },
  //         ),
  //       ),
  //     );
  //
  //     await transaction.commit();
  //     return { message: 'Category reordered successfully.' };
  //   } catch (err) {
  //     await transaction.rollback();
  //     throw err;
  //   }
  // }
  //
  // async delete(id: number) {
  //   const category = await this.categoryModel.findByPk(id);
  //
  //   if (!category) {
  //     throw new NotFoundException(`Category with id ${id} not found`);
  //   }
  //
  //   if (category.dataValues.image) {
  //     await unlink(`uploads/categories/${category.dataValues.image}`);
  //   }
  //
  //   await category.destroy();
  //   return { message: 'Category deleted successfully' };
  // }
}
