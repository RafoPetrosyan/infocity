import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Review } from './review.model';
import { DOMAIN_URL } from '../../../constants';

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
      return rawValue ? `${DOMAIN_URL}/uploads/reviews/${rawValue}` : null;
    },
  })
  original: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('thumbnail');
      return rawValue ? `${DOMAIN_URL}/uploads/reviews/${rawValue}` : null;
    },
  })
  thumbnail: string;
}
