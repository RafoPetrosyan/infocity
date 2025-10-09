import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { UserFollow } from './models/user-follow.model';
import { User } from '../users/models/user.model';
import { Place } from '../places/models/places.model';
import { Event } from '../events/models/events.model';
import { PlaceTranslation } from '../places/models/places-translation.model';
import { EventTranslation } from '../events/models/events-translation.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserFollow,
      User,
      Place,
      Event,
      PlaceTranslation,
      EventTranslation,
    ]),
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
