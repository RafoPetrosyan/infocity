import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { Place } from './places.model';
import { MenuTranslation } from './menus-translation.model';
import { Item } from './items.model';

@Table({ tableName: 'menus' })
export class Menu extends Model {
  @ForeignKey(() => Place)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare place_id: number;

  @BelongsTo(() => Place)
  declare place: Place;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT })
  declare description: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare is_active: boolean;

  @HasMany(() => MenuTranslation)
  declare translations: MenuTranslation[];

  @HasOne(() => MenuTranslation)
  declare translation: MenuTranslation;

  @HasMany(() => Item)
  declare items: Item[];
}


