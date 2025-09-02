import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { EmotionsModel } from '../../emotions/models/emotions.model';

@Table({ tableName: 'user_emotions', timestamps: false })
export class UserEmotions extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @ForeignKey(() => EmotionsModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare emotion_id: number;
}
