import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Event } from './events.model';

@Table({
  tableName: 'event_goings',
  timestamps: true,
})
export class EventGoing extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @ForeignKey(() => Event)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare event_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Event)
  declare event: Event;
}
