import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { EventCategory } from './event-category.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'event_category_translations', timestamps: false })
export class EventCategoryTranslation extends Model {
  @ForeignKey(() => EventCategory)
  @Column({ type: DataType.INTEGER })
  declare event_category_id: number;

  @BelongsTo(() => EventCategory)
  declare event_category: EventCategory;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  declare language: LanguageEnum;

  @Column({ type: DataType.STRING })
  declare name: string;
}
