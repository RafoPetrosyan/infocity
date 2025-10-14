import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Review } from './review.model';
import { ReviewReply } from './review-reply.model';

@Table({ tableName: 'review_likes' })
@Index(['user_id', 'review_id', 'reply_id'])
export class ReviewLike extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @ForeignKey(() => Review)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare review_id: number;

  @ForeignKey(() => ReviewReply)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare reply_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Review)
  declare review: Review;

  @BelongsTo(() => ReviewReply)
  declare reply: ReviewReply;
}

