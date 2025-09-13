import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotAcceptableException,
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
import {
  CreateWorkingTimeDto,
  CreateWorkingTimesDto,
} from './dto/create-working-times.dto';
import { PlaceWorkingTimes } from './models/places-working-times.model';
import _ from 'lodash';
import { PlaceImages } from './models/places-images.model';
import { UpdatePlaceDto } from './dto/update-place.dto';

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

    @InjectModel(PlaceWorkingTimes)
    private workingTimes: typeof PlaceWorkingTimes,

    @InjectModel(PlaceImages)
    private placeImages: typeof PlaceImages,

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

  async getPlaceByIdAllData(id: number, user_id: number) {
    const place = await this.placeModel.findByPk(id, {
      attributes: [
        'id',
        'user_id',
        'image',
        'image_original',
        'slug',
        'email',
        'phone_number',
        'longitude',
        'latitude',
        'social_links',
      ],
      include: [
        {
          model: this.placeTranslationModel,
          as: 'translations',
          attributes: ['name', 'description', 'about', 'language'],
        },
      ],
    });

    if (place && place?.user_id !== user_id) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }
    return place;
  }

  async create(
    userId: number,
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
      user_id: userId,
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

    const placeResponse = await this.getPlaceByIdAllData(place.id, userId);
    return { message: 'Place created successfully.', place: placeResponse };
  }

  async update(
    userId: number,
    dto: UpdatePlaceDto,
    id: number,
    files: {
      coverOriginalName: string | undefined;
      coverOriginalPath: string | undefined;
      coverThumbName: string | undefined;
      coverThumbPath: string | undefined;
      logoFileName: string | undefined;
      logoFilePath: string | undefined;
    },
  ) {
    const place = await this.placeModel.findByPk(id, {
      attributes: ['user_id', 'image_original', 'image', 'logo'],
    });

    if (!place) {
      throw new NotFoundException(`Place with id ${id} not found`);
    }

    if (place.user_id !== userId) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const updateData: any = {};

    if (dto.city_id) {
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
      updateData.city_id = city.id;
    }

    if (dto.category_id) {
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

      updateData.category_id = category.id;
    }

    if (dto.social_links) updateData.social_links = dto.social_links;
    if (dto.longitude) updateData.longitude = dto.longitude;
    if (dto.latitude) updateData.latitude = dto.latitude;
    if (dto.phone_number) updateData.phone_number = dto.phone_number;
    if (dto.email) updateData.email = dto.email;

    if (files.logoFileName) {
      updateData.logo = files.logoFileName;
      if (place.dataValues.logo) {
        await unlink(`uploads/places/${place.dataValues.logo}`);
      }
    }

    if (files.coverThumbName) {
      updateData.image = files.coverThumbName;
      if (place.dataValues.image) {
        await unlink(`uploads/places/${place.dataValues.image}`);
      }
    }
    if (files.coverOriginalName) {
      updateData.image_original = files.coverOriginalName;
      if (place.dataValues.image_original) {
        await unlink(`uploads/places/${place.dataValues.image_original}`);
      }
    }

    if (dto.latitude && dto.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }
    await this.placeModel.update(updateData, {
      where: { id },
    });

    if (dto.en) {
      const data = {
        name: dto.en.name,
        description: dto.en.description || '',
        about: dto.en.about || '',
      };
      await this.placeTranslationModel.update(data, {
        where: { place_id: id, language: 'en' },
      });
    }

    if (dto.hy) {
      const data = {
        name: dto.hy.name,
        description: dto.hy.description || '',
        about: dto.hy.about || '',
      };
      await this.placeTranslationModel.update(data, {
        where: { place_id: id, language: 'hy' },
      });
    }

    if (dto.ru) {
      const data = {
        name: dto.ru.name,
        description: dto.ru.description || '',
        about: dto.ru.about || '',
      };
      await this.placeTranslationModel.update(data, {
        where: { place_id: id, language: 'ru' },
      });
    }

    const placeResponse = await this.getPlaceByIdAllData(id, userId);
    return { message: 'Place updated successfully.', place: placeResponse };
  }

  async getWorkingTimes(id: number) {
    return await this.workingTimes.findAll({
      where: {
        place_id: id,
      },
      attributes: [
        'id',
        'weekday',
        'start_time',
        'end_time',
        'is_working_day',
        'breaks',
      ],
    });
  }

  async createOrUpdateWorkingTimes(
    userId: number,
    dto: CreateWorkingTimesDto,
    id: number,
  ) {
    const place = await this.placeModel.findByPk(id, {
      attributes: ['user_id'],
    });
    if (!place) {
      throw new NotFoundException(`Place with id ${id} not found`);
    }
    if (place.user_id !== userId) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const dbTimes = await this.workingTimes.findAll({
      where: {
        place_id: id,
      },
    });

    if (!dbTimes.length) {
      const insertData: any = dto.working_times.map((e) => ({
        place_id: id,
        ...e,
      }));

      const workingTimes = await this.workingTimes.bulkCreate(insertData);
      return {
        message: 'Working times created successfully.',
        data: workingTimes,
      };
    }

    const insertData: any = dbTimes.map((e) => {
      const dayData = dto.working_times.find(
        (day) => day.weekday === e.dataValues.weekday,
      );
      return { ...e.dataValues, ...dayData };
    });

    const response = await this.workingTimes.bulkCreate(insertData, {
      updateOnDuplicate: ['start_time', 'end_time', 'is_working_day', 'breaks'],
    });

    return {
      message: 'Working times updated successfully.',
      data: response,
    };
  }

  async updateWorkingTime(
    userId: number,
    dto: CreateWorkingTimeDto,
    placeId: number,
    timeId: number,
  ) {
    const place = await this.placeModel.findByPk(placeId, {
      attributes: ['user_id'],
    });
    if (!place) {
      throw new NotFoundException(`Place with id ${placeId} not found`);
    }
    if (place.user_id !== userId) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    await this.workingTimes.update(dto, {
      where: {
        id: timeId,
      },
    });

    const data = await this.getWorkingTimes(placeId);

    return {
      message: 'Working times updated successfully.',
      data,
    };
  }

  async uploadImages(userId: number, id: number, images: any) {
    console.log(images, 'images');
    const place = await this.placeModel.findByPk(id, {
      attributes: ['user_id'],
    });

    const imagePaths = images.reduce((acc: any, item: any) => {
      acc.push(item.path);
      acc.push(item.thumbPath);
      return acc;
    }, []);

    if (!place) {
      await unlinkFiles(imagePaths);
      throw new NotFoundException(`Place with id ${id} not found`);
    }

    if (place.user_id !== userId) {
      await unlinkFiles(imagePaths);
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const existingCount = await this.placeImages.count({
      where: { place_id: id },
    });

    if (existingCount + images.length > 15) {
      await unlinkFiles(imagePaths);
      throw new BadRequestException(`You can upload a maximum of 15 images.`);
    }

    const insertData = images.map((image: any) => {
      return {
        place_id: id,
        original: image.filename,
        thumbnail: image.thumbFilename,
      };
    });

    await this.placeImages.bulkCreate(insertData);

    const response = await this.placeImages.findAll({
      where: {
        place_id: id,
      },
      attributes: ['id', 'original', 'thumbnail', 'type'],
    });
    return { message: 'Images uploaded successfully.', data: response };
  }

  async deleteImage(userId: number, place_id: number, image_id: number) {
    const place = await this.placeModel.findByPk(place_id, {
      attributes: ['user_id'],
    });

    if (!place) {
      throw new NotFoundException(`Place with id ${place_id} not found`);
    }

    if (place.user_id !== userId) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const image = await this.placeImages.findOne({
      where: {
        id: image_id,
        place_id,
      },
      attributes: ['original', 'thumbnail', 'id', 'place_id'],
    });

    if (!image) {
      throw new NotFoundException(`Place with id ${image_id} not found`);
    }
    const imagePaths = [
      `uploads/places/${image.dataValues.original}`,
      `uploads/places/${image.dataValues.thumbnail}`,
    ];
    await unlinkFiles(imagePaths);
    await image.destroy();

    return { message: 'Success' };
  }

  async getImages(place_id: number) {
    const place = await this.placeModel.findByPk(place_id, {
      attributes: ['user_id'],
    });

    if (!place) {
      throw new NotFoundException(`Place with id ${place_id} not found`);
    }

    const gallery = await this.placeImages.findAll({
      where: {
        place_id,
      },
      attributes: ['original', 'thumbnail', 'id', 'type'],
    });

    return { message: 'Gallery list', gallery };
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
