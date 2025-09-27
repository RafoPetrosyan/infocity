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
import { PlaceSection } from './place-sections.model';
import { ItemTranslation } from './items-translation.model';
import { ItemImages } from './items-images.model';
import { DOMAIN_URL } from '../../../constants';

@Table({ tableName: 'items' })
export class Item extends Model {
  @ForeignKey(() => Place)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare place_id: number;

  @BelongsTo(() => Place)
  declare place: Place;

  @ForeignKey(() => PlaceSection)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare place_section_id: number | null;

  @BelongsTo(() => PlaceSection)
  declare place_section: PlaceSection | null;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('image');
      return rawValue ? `${DOMAIN_URL}/uploads/items/${rawValue}` : null;
    },
  })
  declare image: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('image_original');
      return rawValue ? `${DOMAIN_URL}/uploads/items/${rawValue}` : null;
    },
  })
  declare image_original: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0 })
  declare price: number;

  @Column({ type: DataType.STRING(3), allowNull: false, defaultValue: 'AMD' })
  declare currency: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare is_available: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare order: number;

  @HasMany(() => ItemTranslation)
  declare translations: ItemTranslation[];

  @HasOne(() => ItemTranslation)
  declare translation: ItemTranslation;

  @HasMany(() => ItemImages)
  declare gallery: ItemImages[];
}
