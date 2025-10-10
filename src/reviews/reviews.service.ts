import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Review } from './models/review.model';
import { ReviewEmotions } from './models/review-emotions.model';
import { EmotionsModel } from '../emotions/models/emotions.model';
import { User } from '../users/models/user.model';
import { Place } from '../places/models/places.model';
import { Event } from '../events/models/events.model';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetMyReviewsDto } from './dto/query-review.dto';
import { Op } from 'sequelize';
import { LanguageEnum } from '../../types';
import { Sequelize } from 'sequelize-typescript';
import { PlaceTranslation } from '../places/models/places-translation.model';
import { EventTranslation } from '../events/models/events-translation.model';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review)
    private reviewModel: typeof Review,
    @InjectModel(ReviewEmotions)
    private reviewEmotionsModel: typeof ReviewEmotions,
    @InjectModel(EmotionsModel)
    private emotionsModel: typeof EmotionsModel,
    @InjectModel(Place)
    private placeModel: typeof Place,
    @InjectModel(Event)
    private eventModel: typeof Event,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<Review> {
    // Validate that the entity exists
    await this.validateEntity(
      createReviewDto.entity_id,
      createReviewDto.entity_type,
    );

    // Check if user already has a review for this entity
    const existingReview = await this.reviewModel.findOne({
      where: {
        entity_id: createReviewDto.entity_id,
        entity_type: createReviewDto.entity_type,
        user_id: userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this item');
    }

    // Validate emotions if provided
    if (createReviewDto.emotion_ids && createReviewDto.emotion_ids.length > 0) {
      await this.validateEmotions(createReviewDto.emotion_ids);
    }

    const review = await this.reviewModel.create({
      ...createReviewDto,
      user_id: userId,
    });

    // Add emotions if provided
    if (createReviewDto.emotion_ids && createReviewDto.emotion_ids.length > 0) {
      await this.addEmotionsToReview(review.id, createReviewDto.emotion_ids);
    }

    return this.findOne(review.id);
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'avatar'],
        },
        {
          model: ReviewEmotions,
          attributes: ['emotion_id'],
        },
      ],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const emotion_ids = review.emotions?.map((re) => re.emotion_id) ?? [];
    const plainReview = review.toJSON();
    delete plainReview.emotions;

    return {
      ...plainReview,
      emotion_ids,
    };
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    userId: number,
  ): Promise<Review> {
    const review = await this.reviewModel.findOne({
      where: { id, user_id: userId },
    });

    if (!review) {
      throw new NotFoundException(
        'Review not found or you do not have permission to update it',
      );
    }

    // Validate emotions if provided
    if (updateReviewDto.emotion_ids && updateReviewDto.emotion_ids.length > 0) {
      await this.validateEmotions(updateReviewDto.emotion_ids);
    }

    await review.update(updateReviewDto);

    // Update emotions if provided
    if (updateReviewDto.emotion_ids !== undefined) {
      // Remove existing emotions
      await this.reviewEmotionsModel.destroy({
        where: { review_id: id },
      });

      // Add new emotions
      if (updateReviewDto.emotion_ids.length > 0) {
        await this.addEmotionsToReview(id, updateReviewDto.emotion_ids);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const review = await this.reviewModel.findOne({
      where: { id, user_id: userId },
    });

    if (!review) {
      throw new NotFoundException(
        'Review not found or you do not have permission to delete it',
      );
    }

    // Remove associated emotions first
    await this.reviewEmotionsModel.destroy({
      where: { review_id: id },
    });

    await review.destroy();
  }

  async getReviewsByEntity(
    entityId: number,
    entityType: 'place' | 'event',
    page = 1,
    limit = 10,
  ) {
    const offset = (page - 1) * limit;

    const { rows: reviews, count } = await this.reviewModel.findAndCountAll({
      where: {
        entity_id: entityId,
        entity_type: entityType,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'avatar'],
        },
        {
          model: ReviewEmotions,
          attributes: ['emotion_id'],
        },
      ],
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const transformedReviews = reviews.map((review) => {
      const emotion_ids = review.emotions?.map((re) => re.emotion_id) ?? [];
      const plain = review.toJSON();
      delete plain.emotions;

      return {
        ...plain,
        emotion_ids,
      };
    });

    return {
      reviews: transformedReviews,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }

  private async validateEntity(
    entityId: number,
    entityType: 'place' | 'event',
  ): Promise<void> {
    let entity;
    if (entityType === 'place') {
      entity = await this.placeModel.findByPk(entityId);
    } else if (entityType === 'event') {
      entity = await this.eventModel.findByPk(entityId);
    }

    if (!entity) {
      throw new NotFoundException(`${entityType} not found`);
    }
  }

  private async validateEmotions(emotionIds: number[]): Promise<void> {
    const emotions = await this.emotionsModel.findAll({
      where: { id: { [Op.in]: emotionIds } },
    });

    if (emotions.length !== emotionIds.length) {
      throw new BadRequestException('One or more emotions are invalid');
    }
  }

  private async addEmotionsToReview(
    reviewId: number,
    emotionIds: number[],
  ): Promise<void> {
    const reviewEmotions = emotionIds.map((emotionId) => ({
      review_id: reviewId,
      emotion_id: emotionId,
    }));

    await this.reviewEmotionsModel.bulkCreate(reviewEmotions);
  }

  async getUserReviews(
    userId: number,
    query: GetMyReviewsDto,
    lang: LanguageEnum,
  ) {
    const { page = 1, limit = 10, type } = query;
    const offset = (page - 1) * limit;

    const whereCondition: any = { user_id: userId };
    if (type) {
      whereCondition.entity_type = type;
    }

    const { count, rows } = await this.reviewModel.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      attributes: [
        'id',
        'text',
        'entity_id',
        'entity_type',
        'user_id',
        'createdAt',
        'updatedAt',
      ],
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ReviewEmotions,
          attributes: ['emotion_id'],
        },
        {
          model: Place,
          required: false,
          attributes: ['id', 'image'],
          include: [
            {
              model: PlaceTranslation,
              as: 'translation',
              attributes: ['name'],
              where: { language: lang },
              required: false,
            },
          ],
          where: Sequelize.where(Sequelize.col('Review.entity_type'), 'place'),
        },
        {
          model: Event,
          required: false,
          attributes: ['id', 'image'],
          include: [
            {
              model: EventTranslation,
              as: 'translation',
              attributes: ['name'],
              where: { language: lang },
              required: false,
            },
          ],
          where: Sequelize.where(Sequelize.col('Review.entity_type'), 'event'),
        },
      ],
      distinct: true,
    });

    const formattedRows = rows.map((row) => {
      const emotion_ids = row.emotions?.map((re) => re.emotion_id) ?? [];
      const plainReview = row.toJSON();
      delete plainReview.emotions;

      let entityData: any = null;
      if (row.entity_type === 'place' && row.dataValues.place) {
        entityData = {
          id: row.dataValues.place.id,
          name: row.dataValues.place.translation?.name || null,
          image: row.dataValues.place.image,
          type: 'place',
        };
      } else if (row.entity_type === 'event' && row.dataValues.event) {
        entityData = {
          id: row.dataValues.event.id,
          name: row.dataValues.event.translation?.name || null,
          image: row.dataValues.event.image,
          type: 'event',
        };
      }

      delete plainReview?.place;
      delete plainReview?.event;

      return {
        ...plainReview,
        emotion_ids,
        entity: entityData,
      };
    });

    return {
      data: formattedRows,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }
}
