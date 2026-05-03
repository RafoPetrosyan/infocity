import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Event } from './events.model';
import { resolvePublicImageUrl } from '../../../utils/google-cloud-storage';

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
      return resolvePublicImageUrl(this.getDataValue('original'));
    },
  })
  original: string;

  @Column({
    type: DataType.STRING,
    get() {
      return resolvePublicImageUrl(this.getDataValue('thumbnail'));
    },
  })
  thumbnail: string;
}
