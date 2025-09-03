import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Verification } from './models/verification.model';
import { CustomMailerModule } from '../mail/mailer.module';
import { UserEmotions } from './models/user-emotions.model';
import { EmotionsModel } from '../emotions/models/emotions.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Verification,
      UserEmotions,
      EmotionsModel,
    ]),
    CustomMailerModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
