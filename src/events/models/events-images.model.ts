import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Event } from './events.model';
import { DOMAIN_URL } from '../../../constants';

@Table({ tableName: 'event_images', timestamps: false })
export class EventImages extends Model {
  @ForeignKey(() => Event)
  @Column({ type: DataType.INTEGER })
  event_id: number;

  @BelongsTo(() => Event)
  event: Event;

  @Column({
    type: DataType.ENUM('image', 'video'),
    defaultValue: 'image',
  })
  declare type: 'image' | 'video';

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('original');
      return rawValue ? `${DOMAIN_URL}/uploads/events/${rawValue}` : null;
    },
  })
  original: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('thumbnail');
      return rawValue ? `${DOMAIN_URL}/uploads/events/${rawValue}` : null;
    },
  })
  thumbnail: string;
}
