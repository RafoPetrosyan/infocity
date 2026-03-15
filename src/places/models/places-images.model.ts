import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Place } from './places.model';
import { DOMAIN_URL } from '../../../constants';

@Table({ tableName: 'place_images', timestamps: false })
export class PlaceImages extends Model {
  @ForeignKey(() => Place)
  @Column({ type: DataType.INTEGER })
  place_id: number;

  @BelongsTo(() => Place)
  place: Place;

  @Column({
    type: DataType.ENUM('image', 'video'),
    defaultValue: 'image',
  })
  declare type: 'image' | 'video';

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('original');
      if (!rawValue) return null;
      if (rawValue.startsWith('https://') || rawValue.startsWith('http://')) return rawValue;
      return `${DOMAIN_URL}/uploads/places/${rawValue}`;
    },
  })
  original: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('thumbnail');
      if (!rawValue) return null;
      if (rawValue.startsWith('https://') || rawValue.startsWith('http://')) return rawValue;
      return `${DOMAIN_URL}/uploads/places/${rawValue}`;
    },
  })
  thumbnail: string;
}
