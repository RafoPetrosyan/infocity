import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Item } from './models/items.model';
import { ItemImages } from './models/items-images.model';
import { Place } from './models/places.model';
import { unlink } from 'fs/promises';

@Injectable()
export class ItemImagesService {
  constructor(
    @InjectModel(Item)
    private readonly itemModel: typeof Item,

    @InjectModel(ItemImages)
    private readonly itemImagesModel: typeof ItemImages,

    @InjectModel(Place)
    private readonly placeModel: typeof Place,
  ) {}

  private async assertOwnership(placeId: number, userId: number) {
    const place = await this.placeModel.findByPk(placeId, { attributes: ['id', 'user_id'] });
    if (!place) throw new NotFoundException('Place not found');
    if (place.user_id !== userId) throw new BadRequestException('Forbidden');
  }

  async list(placeId: number, itemId: number) {
    const item = await this.itemModel.findOne({ where: { id: itemId, place_id: placeId }, attributes: ['id'] });
    if (!item) throw new NotFoundException('Item not found');
    return this.itemImagesModel.findAll({ where: { item_id: item.id } });
  }

  async create(userId: number, placeId: number, itemId: number, files: { image?: Express.Multer.File[] }) {
    await this.assertOwnership(placeId, userId);
    const item = await this.itemModel.findOne({ where: { id: itemId, place_id: placeId } });
    if (!item) throw new NotFoundException('Item not found');

    const image = files?.image?.[0];
    if (!image) throw new BadRequestException('Image is required');

    await this.itemImagesModel.create({
      item_id: item.id,
      original: image.filename,
      thumbnail: (image as any).thumbFilename ?? null,
      type: 'image',
    } as any);

    return { message: 'Image added successfully.' };
  }

  async remove(userId: number, placeId: number, itemId: number, imageId: number) {
    await this.assertOwnership(placeId, userId);
    const image = await this.itemImagesModel.findOne({ where: { id: imageId }, include: [{ model: this.itemModel, required: true }] });
    if (!image || image.item.place_id !== placeId || image.item.id !== itemId) {
      throw new NotFoundException('Image not found');
    }

    if (image.original) {
      try { await unlink(`./uploads/items/${(image as any).getDataValue('original')}`); } catch {}
    }
    if (image.thumbnail) {
      try { await unlink(`./uploads/items/${(image as any).getDataValue('thumbnail')}`); } catch {}
    }

    await image.destroy();
    return { message: 'Image deleted successfully.' };
  }
}


