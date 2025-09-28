import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { EventCategoryTranslation } from './event-category-translation.model';
import { Event } from './events.model';

@Table({ tableName: 'event_categories' })
export class EventCategory extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare slug: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare order: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @HasMany(() => EventCategoryTranslation)
  declare translations: EventCategoryTranslation[];

  @HasOne(() => EventCategoryTranslation)
  declare translation: EventCategoryTranslation;

  @HasMany(() => Event)
  declare events: Event[];
}
