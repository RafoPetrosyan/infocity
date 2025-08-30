import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { EmotionsModel } from './emotions.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'emotion_translations', timestamps: false })
export class EmotionTranslation extends Model {
  @ForeignKey(() => EmotionsModel)
  @Column({ type: DataType.INTEGER })
  declare emotion_id: number;

  @BelongsTo(() => EmotionsModel)
  emotion: EmotionsModel;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  declare language: LanguageEnum;

  @Column({ type: DataType.STRING(100) })
  declare name: string;
}
