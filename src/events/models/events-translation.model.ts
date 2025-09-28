import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { Event } from './events.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'event_translations', timestamps: false })
export class EventTranslation extends Model {
  @ForeignKey(() => Event)
  @Column({ type: DataType.INTEGER })
  declare event_id: number;

  @BelongsTo(() => Event)
  declare event: Event;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  declare language: LanguageEnum;

  @Column({ type: DataType.STRING })
  declare name: string;

  @Column({ type: DataType.STRING })
  declare description: string;

  @Column({ type: DataType.TEXT })
  declare about: string;
}
