import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Place } from '../../places/models/places.model';
import { Event } from '../../events/models/events.model';

@Table({
  tableName: 'user_follows',
})
export class UserFollow extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare entity_id: number;

  @Column({
    type: DataType.ENUM('place', 'event'),
    allowNull: false,
  })
  declare entity_type: 'place' | 'event';

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
}
