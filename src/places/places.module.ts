import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Place } from './models/places.model';
import { PlaceTranslation } from './models/places-translation.model';
import { PlaceImages } from './models/places-images.model';
import { PlaceWorkingTimes } from './models/places-working-times.model';
import { CityModel } from '../cities/models/city.model';
import { Category } from '../categories/models/category.model';
import { User } from '../users/models/user.model';
import { CityTranslation } from '../cities/models/city-translation.model';
import { CategoryTranslation } from '../categories/models/category-translation.model';
import { PlaceSection } from './models/place-sections.model';
import { PlaceSectionTranslation } from './models/place-sections-translation.model';
import { Item } from './models/items.model';
import { ItemTranslation } from './models/items-translation.model';
import { ItemImages } from './models/items-images.model';
import { PlaceSectionsService } from './place-sections.service';
import { PlaceSectionsController } from './place-sections.controller';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { ItemImagesService } from './item-images.service';
import { ItemImagesController } from './item-images.controller';
import { EntityEmotionCounts } from '../reviews/models/entity-emotion-counts.model';
import { EmotionsModel } from '../emotions/models/emotions.model';
import { UserFollow } from '../follows/models/user-follow.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Place,
      PlaceTranslation,
      PlaceImages,
      PlaceWorkingTimes,
      PlaceSection,
      PlaceSectionTranslation,
      Item,
      ItemTranslation,
      ItemImages,
      CityModel,
      Category,
      User,
      CityTranslation,
      CategoryTranslation,
      EntityEmotionCounts,
      EmotionsModel,
      UserFollow,
    ]),
  ],
  providers: [
    PlacesService,
    PlaceSectionsService,
    ItemsService,
    ItemImagesService,
  ],
  controllers: [
    PlacesController,
    PlaceSectionsController,
    ItemsController,
    ItemImagesController,
  ],
})
export class PlacesModule {}
