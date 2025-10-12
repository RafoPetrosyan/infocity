import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserFollow } from './models/user-follow.model';
import { Place } from '../places/models/places.model';
import { Event } from '../events/models/events.model';
import { FollowDto, GetFollowsDto } from './dto/follow.dto';
import { LanguageEnum } from '../../types';
import { Sequelize } from 'sequelize-typescript';
import { PlaceTranslation } from '../places/models/places-translation.model';
import { EventTranslation } from '../events/models/events-translation.model';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(UserFollow)
    private userFollowModel: typeof UserFollow,

    @InjectModel(Place)
    private placeModel: typeof Place,

    @InjectModel(Event)
    private eventModel: typeof Event,
  ) {}

  async follow(
    userId: number,
    followDto: FollowDto,
  ): Promise<{ message: string; followed: boolean }> {
    const { id, type } = followDto;

    // Check if the item exists
    let item;
    if (type === 'place') {
      item = await this.placeModel.findByPk(id);
    } else if (type === 'event') {
      item = await this.eventModel.findByPk(id);
    }

    if (!item) {
      throw new NotFoundException(`${type} not found`);
    }

    // Check if already following
    const existingFollow = await this.userFollowModel.findOne({
      where: {
        user_id: userId,
        entity_id: id,
        entity_type: type,
      },
    });

    if (existingFollow) {
      await existingFollow.destroy();
      return { message: 'Successfully unfollowed', followed: false };
    }

    // Create the follow
    await this.userFollowModel.create({
      user_id: userId,
      entity_id: id,
      entity_type: type,
    });

    return { message: 'Successfully followed', followed: true };
  }

  async getUserFollows(
    userId: number,
    query: GetFollowsDto,
    lang: LanguageEnum,
  ) {
    const { page = 1, limit = 10, type } = query;
    const offset = (page - 1) * limit;

    const whereCondition: any = { user_id: userId };
    if (type) {
      whereCondition.followable_type = type;
    }

    const { count, rows } = await this.userFollowModel.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      attributes: ['id', 'entity_type', 'createdAt', 'entity_id'],
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Place,
          required: false,
          attributes: ['id', 'image'],
          include: [
            {
              model: PlaceTranslation,
              as: 'translation',
              attributes: ['name'],
              where: { language: lang },
              required: false,
            },
          ],
          where: Sequelize.where(
            Sequelize.col('UserFollow.entity_type'),
            'place',
          ),
        },
        {
          model: Event,
          required: false,
          attributes: ['id', 'image'],
          include: [
            {
              model: EventTranslation,
              as: 'translation',
              attributes: ['name'],
              where: { language: lang },
              required: false,
            },
          ],
          where: Sequelize.where(
            Sequelize.col('UserFollow.entity_type'),
            'event',
          ),
        },
      ],
      distinct: true,
    });

    const formattedRows = rows.map((row) => {
      if (row.entity_type === 'place') {
        return {
          id: row.id,
          type: row.entity_type,
          name: row.dataValues.place.translation.name,
          item_id: row.entity_id,
          image: row.dataValues.place.image,
          createdAt: row.createdAt,
        };
      } else if (row.entity_type === 'event') {
        return {
          id: row.id,
          type: row.entity_type,
          name: row.dataValues.event.translation.name,
          item_id: row.entity_id,
          image: row.dataValues.event.image,
          createdAt: row.createdAt,
        };
      }
      return row;
    });

    return {
      data: formattedRows,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }
}


