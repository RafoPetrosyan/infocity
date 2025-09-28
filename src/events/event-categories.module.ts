import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EventCategoriesService } from './event-categories.service';
import { EventCategoriesController } from './event-categories.controller';
import { EventCategory } from './models/event-category.model';
import { EventCategoryTranslation } from './models/event-category-translation.model';
import { Event } from './models/events.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      EventCategory,
      EventCategoryTranslation,
      Event,
    ]),
  ],
  controllers: [EventCategoriesController],
  providers: [EventCategoriesService],
  exports: [EventCategoriesService],
})
export class EventCategoriesModule {}
