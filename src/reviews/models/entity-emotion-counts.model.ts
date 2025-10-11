import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { EmotionsModel } from '../../emotions/models/emotions.model';

@Table({ tableName: 'entity_emotion_counts' })
export class EntityEmotionCounts extends Model {
  @Column({
    type: DataType.ENUM('place', 'event'),
    allowNull: false,
  })
  declare entity_type: 'place' | 'event';

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare entity_id: number;

  @ForeignKey(() => EmotionsModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare emotion_id: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare count: number;

  @BelongsTo(() => EmotionsModel)
  declare emotion: EmotionsModel;
}
