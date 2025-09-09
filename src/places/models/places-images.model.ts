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
      return rawValue ? `${DOMAIN_URL}/uploads/places/${rawValue}` : null;
    },
  })
  original: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('thumbnail');
      return rawValue ? `${DOMAIN_URL}/uploads/places/${rawValue}` : null;
    },
  })
  thumbnail: string;
}
