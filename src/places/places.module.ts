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

@Module({
  imports: [
    SequelizeModule.forFeature([
      Place,
      PlaceTranslation,
      PlaceImages,
      PlaceWorkingTimes,
      CityModel,
      Category,
    ]),
  ],
  providers: [PlacesService],
  controllers: [PlacesController],
})
export class PlacesModule {}
