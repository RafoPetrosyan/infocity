import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { EmotionTranslation } from './emotions-translation.model';

@Table({ tableName: 'emotions', timestamps: false })
export class EmotionsModel extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({ type: DataType.STRING })
  declare icon: string;

  @Column({ type: DataType.STRING(10) })
  declare color: string;

  @Column({ type: DataType.INTEGER })
  declare order: string;

  @HasMany(() => EmotionTranslation)
  declare translations: EmotionTranslation[];

  @HasOne(() => EmotionTranslation)
  declare lang: EmotionTranslation;
}
