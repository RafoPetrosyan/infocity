import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Review } from './review.model';
import { EmotionsModel } from '../../emotions/models/emotions.model';

@Table({ tableName: 'review_emotions', timestamps: false })
export class ReviewEmotions extends Model {
  @ForeignKey(() => Review)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare review_id: number;

  @ForeignKey(() => EmotionsModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  declare emotion_id: number;

  @BelongsTo(() => Review)
  declare review: Review;

  @BelongsTo(() => EmotionsModel)
  declare emotion: EmotionsModel;
}
