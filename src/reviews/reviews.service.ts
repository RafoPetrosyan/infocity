import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Review } from './models/review.model';
import { ReviewEmotions } from './models/review-emotions.model';
import { EntityEmotionCounts } from './models/entity-emotion-counts.model';
import { ReviewReply } from './models/review-reply.model';
import { EmotionsModel } from '../emotions/models/emotions.model';
import { User } from '../users/models/user.model';
import { Place } from '../places/models/places.model';
import { Event } from '../events/models/events.model';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetMyReviewsDto } from './dto/query-review.dto';
import { CreateReviewReplyDto } from './dto/create-review-reply.dto';
import { UpdateReviewReplyDto } from './dto/update-review-reply.dto';
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
    @InjectModel(EntityEmotionCounts)
    private entityEmotionCountsModel: typeof EntityEmotionCounts,
    @InjectModel(ReviewReply)
    private reviewReplyModel: typeof ReviewReply,
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
      // Update emotion counts for the entity
      await this.incrementEmotionCounts(
        createReviewDto.entity_id,
        createReviewDto.entity_type,
        createReviewDto.emotion_ids,
      );
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

    // Get total reply count
    const replyCount = await this.reviewReplyModel.count({
      where: { review_id: id },
    });

    return {
      ...plainReview,
      emotion_ids,
      reply_count: replyCount,
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
      // Get current emotions before updating
      const currentEmotions = await this.reviewEmotionsModel.findAll({
        where: { review_id: id },
        attributes: ['emotion_id'],
      });
      const currentEmotionIds = currentEmotions.map((re) => re.emotion_id);

      // Remove existing emotions
      await this.reviewEmotionsModel.destroy({
        where: { review_id: id },
      });

      // Add new emotions
      if (updateReviewDto.emotion_ids.length > 0) {
        await this.addEmotionsToReview(id, updateReviewDto.emotion_ids);
      }

      // Update emotion counts for the entity
      await this.updateEmotionCounts(
        review.entity_id,
        review.entity_type,
        currentEmotionIds,
        updateReviewDto.emotion_ids || [],
      );
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

    // Get current emotions before removing
    const currentEmotions = await this.reviewEmotionsModel.findAll({
      where: { review_id: id },
      attributes: ['emotion_id'],
    });
    const currentEmotionIds = currentEmotions.map((re) => re.emotion_id);

    // Remove associated emotions first
    await this.reviewEmotionsModel.destroy({
      where: { review_id: id },
    });

    // Update emotion counts for the entity (decrement)
    if (currentEmotionIds.length > 0) {
      await this.decrementEmotionCounts(
        review.entity_id,
        review.entity_type,
        currentEmotionIds,
      );
    }

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
      attributes: {
        include: [
          [
            Sequelize.literal(`(
          SELECT COUNT(*)
          FROM "review_replies" AS rr
          WHERE rr.review_id = "Review".id
        )`),
            'replies_count',
          ],
        ],
      },
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      reviews,
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

  /**
   * Updates emotion counts for an entity when emotions are added
   */
  private async incrementEmotionCounts(
    entityId: number,
    entityType: 'place' | 'event',
    emotionIds: number[],
  ): Promise<void> {
    if (emotionIds.length === 0) return;

    for (const emotionId of emotionIds) {
      // Use findOrCreate to either find existing record or create new one
      const [emotionCount, created] =
        await this.entityEmotionCountsModel.findOrCreate({
          where: {
            entity_id: entityId,
            entity_type: entityType,
            emotion_id: emotionId,
          },
          defaults: {
            entity_id: entityId,
            entity_type: entityType,
            emotion_id: emotionId,
            count: 1,
          },
        });

      // If the record already exists, increment the count
      if (!created) {
        await emotionCount.increment('count');
      }
    }
  }

  /**
   * Updates emotion counts for an entity when emotions are removed
   */
  private async decrementEmotionCounts(
    entityId: number,
    entityType: 'place' | 'event',
    emotionIds: number[],
  ): Promise<void> {
    if (emotionIds.length === 0) return;

    for (const emotionId of emotionIds) {
      const emotionCount = await this.entityEmotionCountsModel.findOne({
        where: {
          entity_id: entityId,
          entity_type: entityType,
          emotion_id: emotionId,
        },
      });

      if (emotionCount) {
        if (emotionCount.count > 1) {
          // Decrement the count
          await emotionCount.decrement('count');
        } else {
          // Remove the record if count is 1
          await emotionCount.destroy();
        }
      }
    }
  }

  /**
   * Updates emotion counts when emotions are changed (for update operations)
   */
  private async updateEmotionCounts(
    entityId: number,
    entityType: 'place' | 'event',
    oldEmotionIds: number[],
    newEmotionIds: number[],
  ): Promise<void> {
    // Find emotions to add and remove
    const emotionsToAdd = newEmotionIds.filter(
      (id) => !oldEmotionIds.includes(id),
    );
    const emotionsToRemove = oldEmotionIds.filter(
      (id) => !newEmotionIds.includes(id),
    );

    // Remove old emotions
    if (emotionsToRemove.length > 0) {
      await this.decrementEmotionCounts(entityId, entityType, emotionsToRemove);
    }

    // Add new emotions
    if (emotionsToAdd.length > 0) {
      await this.incrementEmotionCounts(entityId, entityType, emotionsToAdd);
    }
  }

  /**
   * Gets emotion counts for a specific entity
   * Returns all emotions with their counts, including 0 for emotions with no reviews
   */
  async getEmotionCounts(
    entityId: number,
    entityType: 'place' | 'event',
  ): Promise<Array<{ emotion_id: number; count: number }>> {
    // Get all available emotions
    const allEmotions = await this.emotionsModel.findAll({
      attributes: ['id'],
      order: [['id', 'ASC']],
    });

    // Get existing emotion counts for this entity
    const existingCounts = await this.entityEmotionCountsModel.findAll({
      where: {
        entity_id: entityId,
        entity_type: entityType,
      },
      attributes: ['emotion_id', 'count'],
    });

    // Create a map of existing counts for quick lookup
    const countMap = new Map(
      existingCounts.map((ec) => [ec.emotion_id, ec.count]),
    );

    // Return all emotions with their counts (0 if not found)
    return allEmotions.map((emotion) => ({
      emotion_id: emotion.id,
      count: countMap.get(emotion.id) || 0,
    }));
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

  // Review Reply Methods

  async createReply(
    createReplyDto: CreateReviewReplyDto,
    userId: number,
  ): Promise<ReviewReply> {
    // Validate that the review exists
    const review = await this.reviewModel.findByPk(createReplyDto.review_id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const reply = await this.reviewReplyModel.create({
      ...createReplyDto,
      user_id: userId,
    });

    return this.findReplyById(reply.id);
  }

  async findReplyById(id: number): Promise<ReviewReply> {
    const reply = await this.reviewReplyModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'avatar'],
        },
      ],
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    return reply;
  }

  async updateReply(
    id: number,
    updateReplyDto: UpdateReviewReplyDto,
    userId: number,
  ): Promise<ReviewReply> {
    const reply = await this.reviewReplyModel.findOne({
      where: { id, user_id: userId },
    });

    if (!reply) {
      throw new NotFoundException(
        'Reply not found or you do not have permission to update it',
      );
    }

    await reply.update(updateReplyDto);
    return this.findReplyById(id);
  }

  async removeReply(id: number, userId: number): Promise<void> {
    const reply = await this.reviewReplyModel.findOne({
      where: { id, user_id: userId },
    });

    if (!reply) {
      throw new NotFoundException(
        'Reply not found or you do not have permission to delete it',
      );
    }

    await reply.destroy();
  }

  async getRepliesByReview(
    reviewId: number,
    page = 1,
    limit = 10,
  ): Promise<any> {
    const offset = (page - 1) * limit;

    // Validate that the review exists
    const review = await this.reviewModel.findByPk(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const { rows: replies, count } =
      await this.reviewReplyModel.findAndCountAll({
        where: { review_id: reviewId },
        include: [
          {
            model: User,
            attributes: ['id', 'first_name', 'last_name', 'avatar'],
          },
        ],
        order: [['createdAt', 'ASC']],
        limit,
        offset,
        distinct: true,
      });

    return {
      replies,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }
}
