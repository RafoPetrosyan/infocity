import { Module } from '@nestjs/common';
import { ProvincesService } from './provinces.service';
import { ProvincesController } from './provinces.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProvinceModel } from './models/province.model';
import { ProvinceTranslation } from './models/province-translation.model';
import { CityModel } from './models/city.model';
import { CityTranslation } from './models/city-translation.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProvinceModel,
      ProvinceTranslation,
      CityModel,
      CityTranslation,
    ]),
  ],
  providers: [ProvincesService],
  controllers: [ProvincesController],
})
export class ProvincesModule {}
