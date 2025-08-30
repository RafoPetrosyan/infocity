import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { EmotionsModel } from './models/emotions.model';
import { EmotionTranslation } from './models/emotions-translation.model';
import { CreateEmotionDto } from './dto/create-emotion.dto';

@Injectable()
export class EmotionsService {
  constructor(
    @InjectModel(EmotionsModel)
    private emotionModel: typeof EmotionsModel,

    @InjectModel(EmotionTranslation)
    private emotionTranslationModel: typeof EmotionTranslation,

    private sequelize: Sequelize,
  ) {}

  async getAll(lang: string) {
    return await this.emotionModel.findAll({
      include: [
        {
          model: this.emotionTranslationModel,
          as: 'lang',
          where: { language: lang },
          attributes: ['name'],
        },
      ],
      order: [['order', 'ASC']],
    });
  }

  async getAllAdmin() {
    return await this.emotionModel.findAll({
      include: [
        {
          model: this.emotionTranslationModel,
          as: 'translations',
          attributes: ['name', 'language', 'id'],
        },
      ],
      order: [['order', 'ASC']],
    });
  }

  async create(dto: CreateEmotionDto) {
    const emotion = await this.emotionModel.create({
      icon: dto.icon,
      color: dto.color,
    });

    const translations = dto.translations.map((t) => ({
      emotion_id: emotion.id,
      language: t.language,
      name: t.name,
    }));
    await this.emotionTranslationModel.bulkCreate(translations);

    return { message: 'Emotion created successfully.' };
  }

  async update(id: number, dto: CreateEmotionDto) {
    // 1) find emotion
    const emotion = await this.emotionModel.findByPk(id, {
      include: [{ model: this.emotionTranslationModel, as: 'translations' }],
    });
    if (!emotion) {
      throw new NotFoundException(`Emotion with id ${id} not found`);
    }

    // 2) update base fields
    await emotion.update({
      icon: dto.icon,
      color: dto.color,
    });

    // 3) update/create translations
    for (const t of dto.translations) {
      const existing = await this.emotionTranslationModel.findOne({
        where: { emotion_id: id, language: t.language },
      });

      if (existing) {
        await existing.update({ name: t.name });
      } else {
        await this.emotionTranslationModel.create({
          emotion_id: id,
          language: t.language,
          name: t.name,
        });
      }
    }

    return { message: 'Emotion updated successfully.' };
  }

  async updateOrdering(items: { id: number; order: number }[]) {
    const transaction = await this.sequelize.transaction();

    try {
      await Promise.all(
        items.map((item) =>
          this.emotionModel.update(
            { order: item.order },
            { where: { id: item.id }, transaction },
          ),
        ),
      );

      await transaction.commit();
      return { message: 'Emotions reordered successfully.' };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async delete(id: number) {
    // First delete translations (if not CASCADE)
    await this.emotionTranslationModel.destroy({
      where: { emotion_id: id },
    });

    // Then delete the main emotion
    const deleted = await this.emotionModel.destroy({
      where: { id },
    });

    if (!deleted) {
      throw new NotFoundException(`Emotion with id ${id} not found`);
    }

    return { message: 'Emotion deleted successfully' };
  }
}
