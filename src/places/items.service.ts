import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Item } from './models/items.model';
import { ItemTranslation } from './models/items-translation.model';
import { Place } from './models/places.model';
import { PlaceSection } from './models/place-sections.model';
import { CreateItemDto, UpdateItemDto } from './dto/create-item.dto';
import { unlink } from 'fs/promises';
import { ItemImages } from './models/items-images.model';
import { unlinkFiles } from '../../utils/unlink-files';
import { Op } from 'sequelize';
import { QueryDto } from '../../types/query.dto';
import { LanguageEnum } from '../../types';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item)
    private readonly itemModel: typeof Item,

    @InjectModel(ItemTranslation)
    private readonly itemTranslationModel: typeof ItemTranslation,

    @InjectModel(ItemImages)
    private readonly itemImagesModel: typeof ItemImages,

    @InjectModel(Place)
    private readonly placeModel: typeof Place,

    @InjectModel(PlaceSection)
    private readonly placeSectionModel: typeof PlaceSection,

    private readonly sequelize: Sequelize,
  ) {}

  private async assertPlaceOwnership(placeId: number, userId: number) {
    const place = await this.placeModel.findByPk(placeId, {
      attributes: ['id', 'user_id'],
    });
    if (!place) throw new NotFoundException('Place not found');
    if (place.user_id !== userId) throw new BadRequestException('Forbidden');
  }

  async list(placeId: number, lang: LanguageEnum, query?: QueryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;
    const placeSectionId = query?.section_id;

    const where: any = {
      place_id: placeId,
      ...(placeSectionId ? { place_section_id: placeSectionId } : {}),
    };

    const { rows, count: total } = await this.itemModel.findAndCountAll({
      where,
      attributes: [
        'id',
        'image',
        'currency',
        'price',
        [Sequelize.col('translation.title'), 'title'],
        [Sequelize.col('translation.description'), 'description'],
      ],
      include: [
        {
          model: this.itemTranslationModel,
          as: 'translation',
          attributes: [],
          where: { language: lang },
        },
        {
          model: this.itemTranslationModel,
          as: 'translations',
          attributes: [],
          ...(query?.search
            ? {
                where: {
                  title: { [Op.iLike]: `%${query.search}%` },
                },
              }
            : {}),
        },
      ],
      // order: [['order', 'ASC']],
      limit,
      offset,
      distinct: true,
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

  async getById(placeId: number, itemId: number, lang: LanguageEnum) {
    const item = await this.itemModel.findOne({
      where: { id: itemId, place_id: placeId },
      attributes: [
        'id',
        'image',
        'image_original',
        'price',
        'currency',
        'is_available',
        [Sequelize.col('translation.title'), 'title'],
        [Sequelize.col('translation.description'), 'description'],
      ],
      include: [
        {
          model: this.itemTranslationModel,
          as: 'translations',
          attributes: ['language', 'title', 'description'],
        },
        {
          model: this.itemTranslationModel,
          as: 'translation',
          where: { language: lang },
          attributes: [],
        },
        {
          model: this.itemImagesModel,
          as: 'gallery',
          attributes: ['id', 'original', 'thumbnail', 'type'],
        },
      ],
    });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async create(
    userId: number,
    placeId: number,
    dto: CreateItemDto,
    files?: { image?: Express.Multer.File | undefined },
  ) {
    await this.assertPlaceOwnership(placeId, userId);

    if (dto.place_section_id) {
      const placeSection = await this.placeSectionModel.findOne({
        where: { id: dto.place_section_id, place_id: placeId },
        attributes: ['id'],
      });
      if (!placeSection) throw new NotFoundException('Place section not found');
    }

    try {
      return await this.sequelize.transaction(async (t) => {
        const item = await this.itemModel.create(
          {
            place_id: placeId,
            place_section_id: dto.place_section_id ?? null,
            price: dto.price ?? 0,
            currency: dto.currency ?? 'AMD',
            order: dto.order ?? 0,
            image: files?.image?.['thumbFilename']
              ? files?.image?.['thumbFilename']
              : null,
            image_original: files?.image?.filename ?? null,
          } as any,
          { transaction: t },
        );

        const translations = [
          { language: 'en', ...dto.en },
          { language: 'hy', ...dto.hy },
          { language: 'ru', ...dto.ru },
        ].map((tr) => ({ ...tr, item_id: item.id }));
        await this.itemTranslationModel.bulkCreate(translations, {
          transaction: t,
        });

        return { message: 'Item created successfully.' };
      });
    } catch (error) {
      if (files?.image) {
        // @ts-ignore
        await unlinkFiles([files.image?.thumbPath, files.image?.path]);
      }
      throw error;
    }
  }

  async update(
    userId: number,
    placeId: number,
    itemId: number,
    dto: UpdateItemDto,
    files?: { image?: Express.Multer.File | undefined },
  ) {
    await this.assertPlaceOwnership(placeId, userId);
    const item = await this.itemModel.findOne({
      where: { id: itemId, place_id: placeId },
    });
    if (!item) throw new NotFoundException('Item not found');

    if (dto.place_section_id) {
      const placeSection = await this.placeSectionModel.findOne({
        where: { id: dto.place_section_id, place_id: placeId },
        attributes: ['id'],
      });
      if (!placeSection) throw new NotFoundException('Place section not found');
    }

    return this.sequelize.transaction(async (t) => {
      const updateData: any = {};
      if (dto.price !== undefined) updateData.price = dto.price;
      if (dto.currency !== undefined) updateData.currency = dto.currency;
      if (dto.order !== undefined) updateData.order = dto.order;
      if (dto.place_section_id !== undefined)
        updateData.place_section_id = dto.place_section_id;

      if (files?.image) {
        if (item.image_original) {
          try {
            await unlink(`./uploads/items/${item.image_original}`);
          } catch {}
        }
        if (item.image) {
          try {
            await unlink(`./uploads/items/${item.image}`);
          } catch {}
        }
        updateData.image_original = files.image.filename;
        updateData.image = (files.image as any)['thumbFilename'] ?? null;
      }

      await item.update(updateData, { transaction: t });

      const updates = [
        dto.en ? { language: 'en', data: dto.en } : null,
        dto.hy ? { language: 'hy', data: dto.hy } : null,
        dto.ru ? { language: 'ru', data: dto.ru } : null,
      ].filter(Boolean) as any[];

      for (const u of updates) {
        const [affected] = await this.itemTranslationModel.update(
          { title: u.data.title, description: u.data.description },
          { where: { item_id: item.id, language: u.language }, transaction: t },
        );
        if (!affected) {
          await this.itemTranslationModel.create(
            {
              item_id: item.id,
              language: u.language,
              title: u.data.title,
              description: u.data.description,
            },
            { transaction: t },
          );
        }
      }

      return { message: 'Item updated successfully.' };
    });
  }

  async remove(userId: number, placeId: number, itemId: number) {
    await this.assertPlaceOwnership(placeId, userId);

    const item = await this.itemModel.findOne({
      where: { id: itemId, place_id: placeId },
    });
    if (!item) throw new NotFoundException('Item not found');

    if (item.image_original) {
      try {
        await unlink(`./uploads/items/${item.image_original}`);
      } catch {}
    }
    if (item.image) {
      try {
        await unlink(`./uploads/items/${item.image}`);
      } catch {}
    }

    await item.destroy();
    return { message: 'Item deleted successfully.' };
  }
}
