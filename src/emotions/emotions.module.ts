import { Module } from '@nestjs/common';
import { EmotionsService } from './emotions.service';
import { EmotionsController } from './emotions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmotionsModel } from './models/emotions.model';
import { EmotionTranslation } from './models/emotions-translation.model';

@Module({
  imports: [SequelizeModule.forFeature([EmotionsModel, EmotionTranslation])],
  providers: [EmotionsService],
  controllers: [EmotionsController],
})
export class EmotionsModule {}
