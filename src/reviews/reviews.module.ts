import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './models/review.model';
import { ReviewEmotions } from './models/review-emotions.model';
import { ReviewReply } from './models/review-reply.model';
import { ReviewLike } from './models/review-like.model';
import { EntityEmotionCounts } from './models/entity-emotion-counts.model';
import { EmotionsModel } from '../emotions/models/emotions.model';
import { User } from '../users/models/user.model';
import { Place } from '../places/models/places.model';
import { Event } from '../events/models/events.model';
import { PlaceTranslation } from '../places/models/places-translation.model';
import { EventTranslation } from '../events/models/events-translation.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Review,
      ReviewEmotions,
      ReviewReply,
      ReviewLike,
      EntityEmotionCounts,
      EmotionsModel,
      User,
      Place,
      Event,
      PlaceTranslation,
      EventTranslation,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
