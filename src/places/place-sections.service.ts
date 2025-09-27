import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PlaceSection } from './models/place-sections.model';
import { PlaceSectionTranslation } from './models/place-sections-translation.model';
import { Place } from './models/places.model';
import { CreatePlaceSectionDto, UpdatePlaceSectionDto } from './dto/create-place-section.dto';

@Injectable()
export class PlaceSectionsService {
  constructor(
    @InjectModel(PlaceSection)
    private readonly placeSectionModel: typeof PlaceSection,

    @InjectModel(PlaceSectionTranslation)
    private readonly placeSectionTranslationModel: typeof PlaceSectionTranslation,

    @InjectModel(Place)
    private readonly placeModel: typeof Place,

    private readonly sequelize: Sequelize,
  ) {}

  private async assertPlaceOwnership(placeId: number, userId: number) {
    const place = await this.placeModel.findByPk(placeId, {
      attributes: ['id', 'user_id'],
    });
    if (!place) throw new NotFoundException('Place not found');
    if (place.user_id !== userId) throw new NotAcceptableException('Forbidden');
    return place;
  }

  async list(placeId: number) {
    return this.placeSectionModel.findAll({
      where: { place_id: placeId },
      include: [{ model: this.placeSectionTranslationModel, as: 'translations' }],
      attributes: ['id', 'is_active'],
      order: [['id', 'DESC']],
    });
  }

  async create(userId: number, placeId: number, dto: CreatePlaceSectionDto) {
    await this.assertPlaceOwnership(placeId, userId);

    return this.sequelize.transaction(async (t) => {
      const placeSection = await this.placeSectionModel.create(
        { place_id: placeId, is_active: dto.is_active ?? true },
        { transaction: t },
      );

      const translations = [
        { language: 'en', ...dto.en },
        { language: 'hy', ...dto.hy },
        { language: 'ru', ...dto.ru },
      ].map((tr) => ({ ...tr, place_section_id: placeSection.id }));

      await this.placeSectionTranslationModel.bulkCreate(translations, {
        transaction: t,
      });

      return { message: 'Place section created successfully.' };
    });
  }

  async update(
    userId: number,
    placeId: number,
    menuId: number,
    dto: UpdatePlaceSectionDto,
  ) {
    await this.assertPlaceOwnership(placeId, userId);

    const placeSection = await this.placeSectionModel.findOne({
      where: { id: menuId, place_id: placeId },
    });

    if (!placeSection) throw new NotFoundException('Place section not found');

    return this.sequelize.transaction(async (t) => {
      if (dto.is_active !== undefined) {
        await placeSection.update({ is_active: dto.is_active }, { transaction: t });
      }

      const updates = [
        dto.en ? { language: 'en', data: dto.en } : null,
        dto.hy ? { language: 'hy', data: dto.hy } : null,
        dto.ru ? { language: 'ru', data: dto.ru } : null,
      ].filter(Boolean) as any[];

      for (const u of updates) {
        const [affected] = await this.placeSectionTranslationModel.update(
          { title: u.data.title, description: u.data.description },
          { where: { place_section_id: placeSection.id, language: u.language }, transaction: t },
        );
        if (!affected) {
          await this.placeSectionTranslationModel.create(
            {
              place_section_id: placeSection.id,
              language: u.language,
              title: u.data.title,
              description: u.data.description,
            },
            { transaction: t },
          );
        }
      }

      return { message: 'Place section updated successfully.' };
    });
  }

  async delete(userId: number, placeId: number, menuId: number) {
    await this.assertPlaceOwnership(placeId, userId);

    const placeSection = await this.placeSectionModel.findOne({
      where: { id: menuId, place_id: placeId },
    });
    if (!placeSection) throw new NotFoundException('Place section not found');

    await this.placeSectionTranslationModel.destroy({ where: { place_section_id: placeSection.id } });
    await placeSection.destroy();
    return { message: 'Place section deleted successfully.' };
  }
}
