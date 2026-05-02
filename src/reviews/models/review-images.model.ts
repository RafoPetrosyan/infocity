import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Review } from './review.model';
import { resolvePublicImageUrl } from '../../../utils/google-cloud-storage';

@Table({ tableName: 'review_images' })
export class ReviewImages extends Model {
  @ForeignKey(() => Review)
  @Column({ type: DataType.INTEGER, allowNull: false })
  review_id: number;

  @BelongsTo(() => Review)
  declare review: Review;

  @Column({
    type: DataType.STRING,
    allowNull: false,
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
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('thumbnail');
      if (!rawValue) return null;
      if (rawValue.startsWith('https://') || rawValue.startsWith('http://')) return rawValue;
      return resolvePublicImageUrl(rawValue);
    },
  })
  thumbnail: string;
}
