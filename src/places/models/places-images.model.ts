import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Place } from './places.model';
import { resolvePublicImageUrl } from '../../../utils/google-cloud-storage';

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
      return resolvePublicImageUrl(rawValue);
    },
  })
  original: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('thumbnail');
      if (!rawValue) return null;
      if (rawValue.startsWith('https://') || rawValue.startsWith('http://')) return rawValue;
      return resolvePublicImageUrl(rawValue);
    },
  })
  thumbnail: string;
}
