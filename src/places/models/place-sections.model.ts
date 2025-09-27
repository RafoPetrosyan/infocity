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
import { PlaceSectionTranslation } from './place-sections-translation.model';
import { Item } from './items.model';

@Table({ tableName: 'place_sections' })
export class PlaceSection extends Model {
  @ForeignKey(() => Place)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare place_id: number;

  @BelongsTo(() => Place)
  declare place: Place;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare is_active: boolean;

  @HasMany(() => PlaceSectionTranslation)
  declare translations: PlaceSectionTranslation[];

  @HasOne(() => PlaceSectionTranslation)
  declare translation: PlaceSectionTranslation;

  @HasMany(() => Item)
  declare items: Item[];
}
