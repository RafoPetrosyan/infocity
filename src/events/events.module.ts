import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './models/events.model';
import { EventTranslation } from './models/events-translation.model';
import { EventImages } from './models/events-images.model';
import { Place } from '../places/models/places.model';
import { PlaceTranslation } from '../places/models/places-translation.model';
import { User } from '../users/models/user.model';
import { CityModel } from '../cities/models/city.model';
import { CityTranslation } from '../cities/models/city-translation.model';
import { EventCategory } from './models/event-category.model';
import { EventCategoryTranslation } from './models/event-category-translation.model';
import { EntityEmotionCounts } from '../reviews/models/entity-emotion-counts.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Event,
      EventTranslation,
      EventImages,
      EventCategory,
      EventCategoryTranslation,
      Place,
      PlaceTranslation,
      CityModel,
      CityTranslation,
      User,
      EntityEmotionCounts,
    ]),
  ],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
