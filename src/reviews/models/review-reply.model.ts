import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Review } from './review.model';

@Table({ tableName: 'review_replies' })
export class ReviewReply extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  declare text: string;

  @ForeignKey(() => Review)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare review_id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @BelongsTo(() => Review)
  declare review: Review;

  @BelongsTo(() => User)
  declare user: User;
}

