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
      return resolvePublicImageUrl(this.getDataValue('original'));
    },
  })
  original: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    get() {
      return resolvePublicImageUrl(this.getDataValue('thumbnail'));
    },
  })
  thumbnail: string;
}
