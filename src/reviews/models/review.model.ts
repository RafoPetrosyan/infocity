import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Place } from '../../places/models/places.model';
import { Event } from '../../events/models/events.model';
import { ReviewEmotions } from './review-emotions.model';
import { ReviewReply } from './review-reply.model';

@Table({ tableName: 'reviews' })
export class Review extends Model {
  @Column({ type: DataType.TEXT, allowNull: true })
  declare text: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare entity_id: number;

  @Column({
    type: DataType.ENUM('place', 'event'),
    allowNull: false,
  })
  declare entity_type: 'place' | 'event';

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Place, {
    foreignKey: 'entity_id',
    constraints: false,
  })
  declare place: Place;

  @BelongsTo(() => Event, {
    foreignKey: 'entity_id',
    constraints: false,
  })
  declare event: Event;

  @HasMany(() => ReviewEmotions)
  declare emotions: ReviewEmotions[];

  @HasMany(() => ReviewReply)
  declare replies: ReviewReply[];
}
