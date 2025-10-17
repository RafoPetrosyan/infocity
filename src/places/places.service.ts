import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Place } from './models/places.model';
import { PlaceTranslation } from './models/places-translation.model';
import { unlink } from 'fs/promises';
import { CreatePlaceDto } from './dto/create-place.dto';
import slugify from 'slugify';
import { CityModel } from '../cities/models/city.model';
import { Category } from '../categories/models/category.model';
import { unlinkFiles } from '../../utils/unlink-files';
import {
  CreateWorkingTimeDto,
  CreateWorkingTimesDto,
} from './dto/create-working-times.dto';
import { PlaceWorkingTimes } from './models/places-working-times.model';
import { PlaceImages } from './models/places-images.model';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Op, Sequelize, QueryTypes } from 'sequelize';
import { LanguageEnum } from '../../types';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { CityTranslation } from '../cities/models/city-translation.model';
import { QueryDto } from '../../types/query.dto';
import { PlaceSection } from './models/place-sections.model';
import { PlaceSectionTranslation } from './models/place-sections-translation.model';
import { EntityEmotionCounts } from '../reviews/models/entity-emotion-counts.model';
import { User } from '../users/models/user.model';
import { EmotionsModel } from '../emotions/models/emotions.model';
import { UserFollow } from '../follows/models/user-follow.model';
import { DOMAIN_URL } from '../../constants';

@Injectable()
export class PlacesService {
  constructor(
    @InjectModel(Place)
    private placeModel: typeof Place,

    @InjectModel(PlaceTranslation)
    private placeTranslationModel: typeof PlaceTranslation,

    @InjectModel(CityModel)
    private cityModel: typeof CityModel,

    @InjectModel(CityTranslation)
    private cityTranslationsModel: typeof CityTranslation,

    @InjectModel(Category)
    private categoryModel: typeof Category,

    @InjectModel(PlaceWorkingTimes)
    private workingTimes: typeof PlaceWorkingTimes,

    @InjectModel(PlaceImages)
    private placeImages: typeof PlaceImages,

    @InjectModel(PlaceSection)
    private placeSectionModel: typeof PlaceSection,

    @InjectModel(PlaceSectionTranslation)
    private placeSectionTranslationModel: typeof PlaceSectionTranslation,

    @InjectModel(EntityEmotionCounts)
    private entityEmotionCountsModel: typeof EntityEmotionCounts,

    @InjectModel(User)
    private usersModel: typeof User,

    @InjectModel(EmotionsModel)
    private emotionsModel: typeof EmotionsModel,

    @InjectModel(UserFollow)
    private userFollowModel: typeof UserFollow,

    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  /** Get Place by ID **/
  async getById(id: number, lang: LanguageEnum, userId: number = 0) {
    const attributes: any[] = [
      'id',
      'image',
      'image_original',
      'slug',
      'email',
      'phone_number',
      'longitude',
      'latitude',
      'social_links',
      'logo',
      'address',
      [Sequelize.col('city->translation.name'), 'city_name'],
      [
        Sequelize.literal(
          `CASE WHEN "Place"."user_id" = '${userId}' THEN true ELSE false END`,
        ),
        'is_owner',
      ],
      [Sequelize.col('translation.name'), 'name'],
      [Sequelize.col('translation.description'), 'description'],
      [Sequelize.col('translation.about'), 'about'],
    ];

    if (userId) {
      attributes.push([
        Sequelize.literal(`EXISTS (
        SELECT 1 FROM "user_follows" uf
        WHERE uf.entity_type = 'place'
          AND uf.entity_id = "Place"."id"
          AND uf.user_id = ${userId}
      )`),
        'is_followed',
      ]);
    } else {
      attributes.push([Sequelize.literal('false'), 'is_followed']);
    }

    const place = await this.placeModel.findByPk(id, {
      attributes,
      include: [
        {
          model: this.placeTranslationModel,
          as: 'translation',
          attributes: [],
          where: { language: lang },
        },
        {
          model: this.workingTimes,
          as: 'working_times',
          attributes: { exclude: ['place_id'] },
        },
        {
          model: this.entityEmotionCountsModel,
          as: 'emotions',
          attributes: ['emotion_id', 'count'],
        },
        {
          model: this.cityModel,
          as: 'city',
          attributes: [],
          include: [
            {
              model: this.cityTranslationsModel,
              as: 'translation',
              attributes: [],
              where: { language: lang },
            },
          ],
        },
        {
          model: this.placeSectionModel,
          as: 'place_sections',
          attributes: ['id'],
          nested: true,
          subQuery: false,
          include: [
            {
              model: this.placeSectionTranslationModel,
              as: 'translation',
              attributes: ['title', 'description'],
              where: { language: lang },
            },
          ],
        },
      ],
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return place;
  }

  /** Get Place by ID All Data **/
  async getPlaceByIdAllData(
    id: number,
    user_id: number,
    lang: LanguageEnum = LanguageEnum.EN,
  ) {
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
        'logo',
        'category_id',
        'city_id',
        'address',
        [Sequelize.col('city->translation.name'), 'city_name'],
      ],
      include: [
        {
          model: this.placeTranslationModel,
          as: 'translations',
          attributes: ['name', 'description', 'about', 'language'],
        },
        {
          model: this.cityModel,
          as: 'city',
          attributes: [],
          include: [
            {
              model: this.cityTranslationsModel,
              as: 'translation',
              attributes: [],
              where: { language: lang },
            },
          ],
        },
      ],
    });

    if (place && place?.user_id !== user_id) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }
    return place;
  }

  /** Get a Places list **/
  async getAll(query: QueryDto, lang: LanguageEnum, userId?: number) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const replacements: any = {
      lang,
      limit,
      offset,
      cdn_url: `${DOMAIN_URL}/uploads/places/`,
    };

    if (query.category_id) {
      where.push(`p.category_id = :category_id`);
      replacements.category_id = query.category_id;
    }

    if (query.search) {
      where.push(`pt.name ILIKE :search`);
      replacements.search = `%${query.search}%`;
    }

    // --- user emotions setup ---
    let userEmotionIds: number[] = [];
    if (userId && !query.emotion_id) {
      const user = await this.usersModel.findByPk(userId, {
        attributes: ['id'],
        include: [
          {
            model: this.emotionsModel,
            attributes: ['id'],
            through: { attributes: [] },
          },
        ],
      });
      if (user?.emotions) {
        userEmotionIds = user.emotions.map((e) => e.id);
      }
    }

    if (query.emotion_id) {
      userEmotionIds.push(query.emotion_id);
    }

    const emotionIdsSql =
      userEmotionIds.length > 0 ? `(${userEmotionIds.join(',')})` : '(NULL)';

    const emotionCondition = `
    CASE WHEN EXISTS (
      SELECT 1 FROM entity_emotion_counts eec
      WHERE eec.entity_type = 'place'
        AND eec.entity_id = p.id
        AND eec.emotion_id IN ${emotionIdsSql}
    ) THEN 1 ELSE 0 END AS has_user_emotion
  `;

    const isFollowedCondition = userId
      ? `EXISTS (
        SELECT 1 FROM user_follows uf
        WHERE uf.entity_type = 'place'
          AND uf.entity_id = p.id
          AND uf.user_id = ${userId}
      ) AS is_followed`
      : `FALSE AS is_followed`;

    // --- where clause ---
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // --- main query ---
    const sql = `
      SELECT
        p.id,
        (:cdn_url || p.image) AS image,
        p.slug,
        pt.name,
        pt.description,
        c.slug AS category_slug,
        ${isFollowedCondition},
        ${emotionCondition},
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
          'emotion_id', eec.emotion_id,
          'count', eec.count
        )
      ) FILTER (WHERE eec.emotion_id IS NOT NULL),
          '[]'
        ) AS emotions
      FROM places p
             JOIN place_translations pt
                  ON pt.place_id = p.id AND pt.language = :lang
             LEFT JOIN categories c ON c.id = p.category_id
             LEFT JOIN entity_emotion_counts eec
                       ON eec.entity_type = 'place' AND eec.entity_id = p.id
        ${whereClause}
      GROUP BY p.id, pt.name, pt.description, c.slug
      ORDER BY has_user_emotion DESC, p.id DESC
        LIMIT :limit OFFSET :offset
    `;

    const countSql = `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM places p
             JOIN place_translations pt
                  ON pt.place_id = p.id AND pt.language = :lang
        ${whereClause}
    `;

    const [rows, countResult] = await Promise.all([
      this.sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      }),
      this.sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
      }),
    ]);

    // @ts-ignore
    const total = Number(countResult[0]?.total || 0);

    return {
      data: rows,
      meta: {
        total,
        page,
        limit,
        pages_count: Math.ceil(total / limit),
      },
    };
  }

  async getAllForAdmin(query: QueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const search = query.search ? query.search.trim() : null;

    const { count, rows } = await this.placeModel.findAndCountAll({
      attributes: [
        'id',
        'logo',
        'image',
        'slug',
        'latitude',
        'longitude',
        'email',
        'phone_number',
        'address',
        [Sequelize.col('translation.name'), 'name'],
        [Sequelize.col('translation.description'), 'description'],
        [Sequelize.col('translation.about'), 'about'],
      ],
      include: [
        {
          model: this.placeTranslationModel,
          as: 'translation',
          attributes: [],
          where: {
            language: 'en',
            ...(search && {
              name: {
                [Op.iLike]: `%${search}%`,
              },
            }),
          },
        },
        {
          model: this.usersModel,
          as: 'owner',
          attributes: [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone_number',
          ],
        },
      ],
      limit,
      offset,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }

  /** Get an Attractions list for admin **/
  async getAttractionsForAdmin(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const attractionCategory = await this.categoryModel.findOne({
      where: { slug: 'attractions' },
      attributes: ['id'],
    });

    if (!attractionCategory) {
      return [];
    }

    const { rows, count: total } = await this.placeModel.findAndCountAll({
      where: { category_id: attractionCategory.id },
      attributes: ['id', 'image', 'slug', 'latitude', 'longitude'],
      distinct: true,
      include: [
        {
          model: this.placeTranslationModel,
          as: 'translation',
          attributes: ['name', 'description', 'about'],
          where: { language: 'en' },
        },
        {
          model: this.placeTranslationModel,
          as: 'translations',
          attributes: [],
          required: true,
          where: {
            ...(query.search
              ? {
                  name: { [Op.iLike]: `%${query.search}%` },
                }
              : {}),
          },
        },
      ],
      limit,
      offset,
    });

    return {
      data: rows,
      meta: {
        total,
        page,
        limit,
        pages_count: Math.ceil(total / limit),
      },
    };
  }

  /** Create place **/
  async create(
    userId: number,
    dto: CreatePlaceDto,
    files: {
      coverOriginalName: string | undefined;
      coverOriginalPath: string | undefined;
      coverThumbName: string | undefined;
      coverThumbPath: string | undefined;
      logoFileName?: string | undefined;
      logoFilePath?: string | undefined;
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
      address: dto.address || null,
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

  /** Create attraction **/
  async createAttraction(
    userId: number,
    dto: CreateAttractionDto,
    files: {
      coverOriginalName: string | undefined;
      coverOriginalPath: string | undefined;
      coverThumbName: string | undefined;
      coverThumbPath: string | undefined;
    },
  ) {
    const attractionCategory = await this.categoryModel.findOne({
      where: { slug: 'attractions' },
      attributes: ['id'],
    });

    if (!attractionCategory) {
      await unlinkFiles([files.coverOriginalPath, files.coverThumbPath]);
      throw new NotFoundException(`Attraction category is not exist`);
    }

    return await this.create(
      userId,
      { ...dto, category_id: attractionCategory.id },
      files,
    );
  }

  /** Update place **/
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
    if (dto.address) updateData.address = dto.address;

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

  /** Get working times **/
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

  /** Create or update working times **/
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

  /** Update working time **/
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

  /** Upload images  **/
  async uploadImages(
    userId: number,
    id: number,
    images: any,
    userRole: string,
  ) {
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

    if (userRole === 'user' && place.user_id !== userId) {
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

  /** Delete image **/
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

  /** Get images **/
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

  /** Delete place **/
  async delete(userId: number, place_id: number) {
    const place = await this.placeModel.findByPk(place_id, {
      attributes: ['user_id', 'logo', 'image', 'image_original', 'id'],
    });

    if (!place) {
      throw new NotFoundException(`Place with id ${place_id} not found`);
    }

    if (place.user_id !== userId) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const images = await this.placeImages.findAll({
      where: {
        place_id,
      },
      attributes: ['original', 'thumbnail'],
    });

    const imagePaths: string[] = [];

    if (place.dataValues.logo) {
      imagePaths.push(`uploads/places/${place.dataValues.logo}`);
    }
    if (place.dataValues.image) {
      imagePaths.push(`uploads/places/${place.dataValues.image}`);
    }
    if (place.dataValues.image_original) {
      imagePaths.push(`uploads/places/${place.dataValues.image_original}`);
    }

    if (images && images.length > 0) {
      images.forEach((image: any) => {
        imagePaths.push(`uploads/places/${image.dataValues.original}`);
        imagePaths.push(`uploads/places/${image.dataValues.thumbnail}`);
      });
    }

    await unlinkFiles(imagePaths);
    await place.destroy();

    return { message: 'Success' };
  }
}
