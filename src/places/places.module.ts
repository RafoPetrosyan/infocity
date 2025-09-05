import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Place } from './models/places.model';
import { PlaceTranslation } from './models/places-translation.model';

@Module({
  imports: [SequelizeModule.forFeature([Place, PlaceTranslation])],
  providers: [PlacesService],
  controllers: [PlacesController],
})
export class PlacesModule {}
