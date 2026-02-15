import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Event } from './models/events.model';
import { EventTranslation } from './models/events-translation.model';
import { EventCategory } from './models/event-category.model';
import { EventCategoryTranslation } from './models/event-category-translation.model';
import { unlink } from 'fs/promises';
import { CreateEventDto } from './dto/create-event.dto';
import slugify from 'slugify';
import { Place } from '../places/models/places.model';
import { EventImages } from './models/events-images.model';
import { UpdateEventDto } from './dto/update-event.dto';
import { Op, Sequelize, QueryTypes } from 'sequelize';
import { PlaceTranslation } from '../places/models/places-translation.model';
import { CityModel } from '../cities/models/city.model';
import { CityTranslation } from '../cities/models/city-translation.model';
import { LanguageEnum } from '../../types';
import { QueryDto } from '../../types/query.dto';
import { unlinkFiles } from '../../utils/unlink-files';
import { DOMAIN_URL } from '../../constants';
import { EntityEmotionCounts } from '../reviews/models/entity-emotion-counts.model';
import { User } from '../users/models/user.model';
import { EmotionsModel } from '../emotions/models/emotions.model';
import { EventGoing } from './models/event-going.model';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event)
    private eventModel: typeof Event,

    @InjectModel(EventTranslation)
    private eventTranslationModel: typeof EventTranslation,

    @InjectModel(Place)
    private placeModel: typeof Place,

    @InjectModel(PlaceTranslation)
    private placeTranslationModel: typeof PlaceTranslation,

    @InjectModel(CityModel)
    private cityModel: typeof CityModel,

    @InjectModel(CityTranslation)
    private cityTranslationsModel: typeof CityTranslation,

    @InjectModel(EventImages)
    private eventImages: typeof EventImages,

    @InjectModel(EventCategory)
    private eventCategoryModel: typeof EventCategory,

    @InjectModel(EventCategoryTranslation)
    private eventCategoryTranslationModel: typeof EventCategoryTranslation,

    @InjectModel(EntityEmotionCounts)
    private entityEmotionCountsModel: typeof EntityEmotionCounts,

    @InjectModel(User)
    private usersModel: typeof User,

    @InjectModel(EmotionsModel)
    private emotionsModel: typeof EmotionsModel,

    @InjectModel(EventGoing)
    private eventGoingModel: typeof EventGoing,

    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  /** Get Event by ID **/
  async getById(id: number, lang: LanguageEnum, userId: number = 0) {
    const attributes: any[] = [
      'id',
      'image',
      'image_original',
      'slug',
      'start_date',
      'end_date',
      'email',
      'phone_number',
      'longitude',
      'latitude',
      'address',
      'price',
      'max_attendees',
      'is_active',
      'event_category_id',
      'place_id',
      [Sequelize.col('place->city->translation.name'), 'city_name'],
      [
        Sequelize.literal(
          `CASE WHEN "Event"."user_id" = '${userId}' THEN true ELSE false END`,
        ),
        'is_owner',
      ],
      [Sequelize.col('translation.name'), 'name'],
      [Sequelize.col('translation.description'), 'description'],
      [Sequelize.col('translation.about'), 'about'],
      [Sequelize.col('place->translation.name'), 'place_name'],
      [
        Sequelize.literal(
          `CONCAT('${DOMAIN_URL}/uploads/places/', "place"."image")`,
        ),
        'place_image',
      ],
      [Sequelize.col('event_category->translation.name'), 'category_name'],
    ];

    if (userId) {
      attributes.push([
        Sequelize.literal(`EXISTS (
        SELECT 1 FROM "user_follows" uf
        WHERE uf.entity_type = 'event'
          AND uf.entity_id = "Event"."id"
          AND uf.user_id = ${userId}
      )`),
        'is_followed',
      ]);
      attributes.push([
        Sequelize.literal(`EXISTS (
        SELECT 1 FROM "event_goings" eg
        WHERE eg.event_id = "Event"."id"
          AND eg.user_id = ${userId}
      )`),
        'is_going',
      ]);
    } else {
      attributes.push([Sequelize.literal('false'), 'is_followed']);
      attributes.push([Sequelize.literal('false'), 'is_going']);
    }

    // Add going count
    attributes.push([
      Sequelize.literal(`(
        SELECT COUNT(*) FROM "event_goings" eg
        WHERE eg.event_id = "Event"."id"
      )`),
      'going_count',
    ]);

    const event = await this.eventModel.findByPk(id, {
      attributes,
      include: [
        {
          model: this.eventTranslationModel,
          as: 'translation',
          attributes: [],
          where: { language: lang },
        },
        {
          model: this.placeModel,
          as: 'place',
          attributes: [],
          include: [
            {
              model: this.placeTranslationModel,
              as: 'translation',
              attributes: [],
              where: { language: lang },
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
        },
        {
          model: this.eventCategoryModel,
          as: 'event_category',
          attributes: [],
          include: [
            {
              model: this.eventCategoryTranslationModel,
              as: 'translation',
              attributes: [],
              where: { language: lang },
            },
          ],
        },
        {
          model: this.entityEmotionCountsModel,
          as: 'emotions',
          attributes: ['emotion_id', 'count'],
        },
      ],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  /** Get Event by ID All Data **/
  async getEventByIdAllData(
    id: number,
    user_id: number,
    lang: LanguageEnum = LanguageEnum.EN,
  ) {
    const event = await this.eventModel.findByPk(id, {
      attributes: [
        'id',
        'user_id',
        'image',
        'image_original',
        'slug',
        'start_date',
        'end_date',
        'email',
        'phone_number',
        'longitude',
        'latitude',
        'address',
        'price',
        'max_attendees',
        'is_active',
        'is_featured',
        'place_id',
      ],
      include: [
        {
          model: this.eventTranslationModel,
          as: 'translations',
          attributes: ['name', 'description', 'about', 'language'],
        },
      ],
    });

    if (event && event?.user_id !== user_id) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }
    return event;
  }

  /** Get Events list **/
  async getAll(query: QueryDto, lang: LanguageEnum, userId?: number) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const replacements: any = {
      lang,
      limit,
      offset,
      cdn_url: `${DOMAIN_URL}/uploads/events/`,
    };

    // --- filters ---
    if (query.place_id) {
      where.push(`e.place_id = :place_id`);
      replacements.place_id = query.place_id;
    }
    if (query.is_active !== undefined) {
      where.push(`e.is_active = :is_active`);
      replacements.is_active = query.is_active;
    }
    if (query.is_featured !== undefined) {
      where.push(`e.is_featured = :is_featured`);
      replacements.is_featured = query.is_featured;
    }
    if (query.event_category_id) {
      where.push(`e.event_category_id = :event_category_id`);
      replacements.event_category_id = query.event_category_id;
    }
    if (query.start_date) {
      where.push(`e.start_date >= :start_date`);
      replacements.start_date = query.start_date;
    }
    if (query.end_date) {
      where.push(`e.end_date <= :end_date`);
      replacements.end_date = query.end_date;
    }
    if (query.search) {
      where.push(`et.name ILIKE :search`);
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
      WHERE eec.entity_type = 'event'
        AND eec.entity_id = e.id
        AND eec.emotion_id IN ${emotionIdsSql}
    ) THEN 1 ELSE 0 END AS has_user_emotion
  `;

    const isFollowedCondition = userId
      ? `EXISTS (
        SELECT 1 FROM user_follows uf
        WHERE uf.entity_type = 'event'
          AND uf.entity_id = e.id
          AND uf.user_id = ${userId}
      ) AS is_followed`
      : `FALSE AS is_followed`;

    // --- where clause ---
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // --- sort setup ---
    const sortField = query.sort_field || 'start_date';
    const sortOrder = query.sort_order === 'DESC' ? 'DESC' : 'ASC';
    const orderClause = `ORDER BY has_user_emotion DESC, e.${sortField} ${sortOrder}, e.id DESC`;

    // --- main query ---
    const sql = `
    SELECT
      e.id,
      (:cdn_url || e.image) AS image,
      e.slug,
      e.start_date,
      e.end_date,
      e.price,
      e.place_id,
      et.name,
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
    FROM events e
           JOIN event_translations et
                ON et.event_id = e.id AND et.language = :lang
           LEFT JOIN entity_emotion_counts eec
                     ON eec.entity_type = 'event' AND eec.entity_id = e.id
      ${whereClause}
    GROUP BY e.id, et.name
    ${orderClause}
    LIMIT :limit OFFSET :offset
  `;

    const countSql = `
    SELECT COUNT(DISTINCT e.id) AS total
    FROM events e
           JOIN event_translations et
                ON et.event_id = e.id AND et.language = :lang
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

  /** Create event **/
  async create(
    userId: number,
    dto: CreateEventDto,
    files: {
      coverOriginalName: string | undefined;
      coverOriginalPath: string | undefined;
      coverThumbName: string | undefined;
      coverThumbPath: string | undefined;
    },
  ) {
    if (!files.coverOriginalName) {
      if (files.coverThumbPath) await unlink(files.coverThumbPath);
      throw new NotFoundException(`Cover image is required`);
    }

    const place = await this.placeModel.findByPk(dto.place_id, {
      attributes: ['id'],
    });
    if (!place) {
      await unlinkFiles([files.coverOriginalPath, files.coverThumbPath]);
      throw new NotFoundException(`Place does not exist`);
    }

    let baseSlug = slugify(dto.en.name, { lower: true, strict: true });
    const existBaseSlug = await this.eventModel.findOne({
      where: { slug: baseSlug },
      attributes: ['id'],
    });

    const eventData: any = {
      slug: existBaseSlug ? Date.now().toString() + '-' + baseSlug : baseSlug,
      image: files.coverThumbName,
      image_original: files.coverOriginalName,
      place_id: place.id,
      event_category_id: dto.event_category_id || null,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
      email: dto.email || null,
      address: dto.address || null,
      phone_number: dto.phone_number || null,
      longitude: dto.longitude || null,
      latitude: dto.latitude || null,
      price: dto.price || null,
      max_attendees: dto.max_attendees || null,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      is_featured: dto.is_featured || false,
      user_id: userId,
    };

    if (dto.latitude && dto.longitude) {
      eventData.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    const event = await this.eventModel.create(eventData);
    if (existBaseSlug) {
      const finalSlug = `${baseSlug}-${event.id}`;
      await event.update({ slug: finalSlug });
    }

    const languages = [
      {
        language: 'en',
        name: dto.en.name,
        description: dto.en.description || '',
        about: dto.en.about || '',
        event_id: event.id,
      },
      {
        language: 'hy',
        name: dto.hy.name,
        description: dto.hy.description || '',
        about: dto.hy.about || '',
        event_id: event.id,
      },
      {
        language: 'ru',
        name: dto.ru.name,
        description: dto.ru.description || '',
        about: dto.ru.about || '',
        event_id: event.id,
      },
    ];
    await this.eventTranslationModel.bulkCreate(languages);

    // Save selected emotions from the body (creator's initial emotions for the event)
    const emotionIds = dto.emotion_ids?.filter((id) => id > 0) ?? [];
    if (emotionIds.length > 0) {
      const existingEmotions = await this.emotionsModel.findAll({
        where: { id: emotionIds },
        attributes: ['id'],
      });
      const validIds = existingEmotions.map((e) => e.id);
      if (validIds.length > 0) {
        await this.entityEmotionCountsModel.bulkCreate(
          validIds.map((emotionId) => ({
            entity_type: 'event' as const,
            entity_id: event.id,
            emotion_id: emotionId,
            count: 1,
          })),
        );
      }
    }

    const eventResponse = await this.getEventByIdAllData(event.id, userId);
    return { message: 'Event created successfully.', event: eventResponse };
  }

  /** Update event **/
  async update(
    userId: number,
    dto: UpdateEventDto,
    id: number,
    files: {
      coverOriginalName: string | undefined;
      coverOriginalPath: string | undefined;
      coverThumbName: string | undefined;
      coverThumbPath: string | undefined;
    },
  ) {
    const event = await this.eventModel.findByPk(id, {
      attributes: ['user_id', 'image_original', 'image'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    if (event.user_id !== userId) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const updateData: any = {};

    if (dto.place_id) {
      const place = await this.placeModel.findByPk(dto.place_id, {
        attributes: ['id'],
      });

      if (!place) {
        await unlinkFiles([files.coverOriginalPath, files.coverThumbPath]);
        throw new NotFoundException(`Place does not exist`);
      }
      updateData.place_id = place.id;
    }

    if (dto.event_category_id !== undefined) {
      updateData.event_category_id = dto.event_category_id;
    }

    if (dto.start_date) updateData.start_date = new Date(dto.start_date);
    if (dto.end_date) updateData.end_date = new Date(dto.end_date);
    if (dto.longitude) updateData.longitude = dto.longitude;
    if (dto.latitude) updateData.latitude = dto.latitude;
    if (dto.phone_number) updateData.phone_number = dto.phone_number;
    if (dto.email) updateData.email = dto.email;
    if (dto.address) updateData.address = dto.address;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.max_attendees) updateData.max_attendees = dto.max_attendees;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
    if (dto.is_featured !== undefined) updateData.is_featured = dto.is_featured;

    if (files.coverThumbName) {
      updateData.image = files.coverThumbName;
      if (event.dataValues.image) {
        await unlink(`uploads/events/${event.dataValues.image}`);
      }
    }
    if (files.coverOriginalName) {
      updateData.image_original = files.coverOriginalName;
      if (event.dataValues.image_original) {
        await unlink(`uploads/events/${event.dataValues.image_original}`);
      }
    }

    if (dto.latitude && dto.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    await this.eventModel.update(updateData, {
      where: { id },
    });

    if (dto.en) {
      const data = {
        name: dto.en.name,
        description: dto.en.description || '',
        about: dto.en.about || '',
      };
      await this.eventTranslationModel.update(data, {
        where: { event_id: id, language: 'en' },
      });
    }

    if (dto.hy) {
      const data = {
        name: dto.hy.name,
        description: dto.hy.description || '',
        about: dto.hy.about || '',
      };
      await this.eventTranslationModel.update(data, {
        where: { event_id: id, language: 'hy' },
      });
    }

    if (dto.ru) {
      const data = {
        name: dto.ru.name,
        description: dto.ru.description || '',
        about: dto.ru.about || '',
      };
      await this.eventTranslationModel.update(data, {
        where: { event_id: id, language: 'ru' },
      });
    }

    const eventResponse = await this.getEventByIdAllData(id, userId);
    return { message: 'Event updated successfully.', event: eventResponse };
  }

  /** Upload images  **/
  async uploadImages(
    userId: number,
    id: number,
    images: any,
    userRole: string,
  ) {
    const event = await this.eventModel.findByPk(id, {
      attributes: ['user_id'],
    });

    const imagePaths = images.reduce((acc: any, item: any) => {
      acc.push(item.path);
      acc.push(item.thumbPath);
      return acc;
    }, []);

    if (!event) {
      await unlinkFiles(imagePaths);
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    if (userRole === 'user' && event.user_id !== userId) {
      await unlinkFiles(imagePaths);
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const existingCount = await this.eventImages.count({
      where: { event_id: id },
    });

    if (existingCount + images.length > 15) {
      await unlinkFiles(imagePaths);
      throw new BadRequestException(`You can upload a maximum of 15 images.`);
    }

    const insertData = images.map((image: any) => {
      return {
        event_id: id,
        original: image.filename,
        thumbnail: image.thumbFilename,
      };
    });

    await this.eventImages.bulkCreate(insertData);

    const response = await this.eventImages.findAll({
      where: {
        event_id: id,
      },
      attributes: ['id', 'original', 'thumbnail', 'type'],
    });
    return { message: 'Images uploaded successfully.', data: response };
  }

  /** Delete image **/
  async deleteImage(userId: number, event_id: number, image_id: number) {
    const event = await this.eventModel.findByPk(event_id, {
      attributes: ['user_id'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${event_id} not found`);
    }

    if (event.user_id !== userId) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const image = await this.eventImages.findOne({
      where: {
        id: image_id,
        event_id,
      },
      attributes: ['original', 'thumbnail', 'id', 'event_id'],
    });

    if (!image) {
      throw new NotFoundException(`Image with id ${image_id} not found`);
    }
    const imagePaths = [
      `uploads/events/${image.dataValues.original}`,
      `uploads/events/${image.dataValues.thumbnail}`,
    ];
    await unlinkFiles(imagePaths);
    await image.destroy();

    return { message: 'Success' };
  }

  /** Get images **/
  async getImages(event_id: number) {
    const event = await this.eventModel.findByPk(event_id, {
      attributes: ['user_id'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${event_id} not found`);
    }

    const gallery = await this.eventImages.findAll({
      where: {
        event_id,
      },
      attributes: ['original', 'thumbnail', 'id', 'type'],
    });

    return { message: 'Gallery list', gallery };
  }

  /** Delete event **/
  async delete(userId: number, event_id: number) {
    const event = await this.eventModel.findByPk(event_id, {
      attributes: ['user_id', 'image', 'image_original', 'id'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${event_id} not found`);
    }

    if (event.user_id !== userId) {
      throw new NotAcceptableException(`Only allowed to owner`);
    }

    const images = await this.eventImages.findAll({
      where: {
        event_id,
      },
      attributes: ['original', 'thumbnail'],
    });

    const imagePaths: string[] = [];

    if (event.dataValues.image) {
      imagePaths.push(`uploads/events/${event.dataValues.image}`);
    }
    if (event.dataValues.image_original) {
      imagePaths.push(`uploads/events/${event.dataValues.image_original}`);
    }

    if (images && images.length > 0) {
      images.forEach((image: any) => {
        imagePaths.push(`uploads/events/${image.dataValues.original}`);
        imagePaths.push(`uploads/events/${image.dataValues.thumbnail}`);
      });
    }

    await unlinkFiles(imagePaths);
    await event.destroy();

    return { message: 'Success' };
  }

  /** Toggle going to event **/
  async toggleGoing(
    userId: number,
    eventId: number,
  ): Promise<{ message: string; going: boolean }> {
    // Check if event exists
    const event = await this.eventModel.findByPk(eventId, {
      attributes: ['id'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is already going
    const existingGoing = await this.eventGoingModel.findOne({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });

    if (existingGoing) {
      await existingGoing.destroy();
      return { message: 'Successfully removed from going list', going: false };
    }

    // Add user to going list
    await this.eventGoingModel.create({
      user_id: userId,
      event_id: eventId,
    });

    return { message: 'Successfully added to going list', going: true };
  }

  /** Get users going to an event **/
  async getEventGoings(eventId: number, query: QueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search;
    const offset = (page - 1) * limit;

    // Add search condition if provided
    let userWhereConditions: any = {};
    if (search) {
      userWhereConditions = {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          Sequelize.where(
            Sequelize.fn(
              'concat',
              Sequelize.col('first_name'),
              ' ',
              Sequelize.col('last_name'),
            ),
            {
              [Op.iLike]: `%${query.search}%`,
            },
          ),
        ],
      };
    }

    const { count, rows } = await this.eventGoingModel.findAndCountAll({
      where: {
        event_id: eventId,
      },
      limit,
      offset,
      attributes: ['id', 'createdAt'],
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: this.usersModel,
          attributes: ['id', 'first_name', 'last_name', 'avatar'],
          where: userWhereConditions,
          required: true,
        },
      ],
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

  /** Get users going to an event **/
  async getMyGoings(userId: number, query: QueryDto, lang: LanguageEnum) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const search = query.search;
    const offset = (page - 1) * limit;

    // Add search condition if provided
    let eventWhereConditions: any = {};
    if (search) {
      eventWhereConditions = {
        [Op.or]: [
          { '$event->translation.name$': { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await this.eventGoingModel.findAndCountAll({
      where: {
        user_id: userId,
        ...eventWhereConditions,
      },
      limit,
      offset,
      attributes: [
        'id',
        'createdAt',
        [Sequelize.col('event->translation.name'), 'name'],
        [Sequelize.col('event->translation.description'), 'description'],
        [Sequelize.col('event.slug'), 'slug'],
        [Sequelize.col('event.id'), 'event_id'],
        [
          Sequelize.fn(
            'concat',
            `${DOMAIN_URL}/uploads/events/`,
            Sequelize.col('event.image'),
          ),
          'image',
        ],
      ],
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: this.eventModel,
          as: 'event',
          attributes: [],
          required: true,
          include: [
            {
              model: this.eventTranslationModel,
              as: 'translation',
              attributes: [],
              where: { language: lang },
            },
          ],
        },
      ],
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
}
