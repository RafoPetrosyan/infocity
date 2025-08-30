import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CityModel } from './models/city.model';
import { CityTranslation } from './models/city-translation.model';

@Module({
  imports: [SequelizeModule.forFeature([CityModel, CityTranslation])],
  providers: [CitiesService],
  controllers: [CitiesController],
})
export class CitiesModule {}
