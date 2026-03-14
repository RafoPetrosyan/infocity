import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { SubCategoryTranslation } from './sub-category-translation.model';
import { Place } from '../../places/models/places.model';
import { Category } from './category.model';

@Table({ tableName: 'sub_categories' })
export class SubCategory extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare slug: string;

  @Column({ type: DataType.STRING, field: 'image' })
  declare icon: string;

  @Column({ type: DataType.INTEGER })
  declare order: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare category_id: number;

  @BelongsTo(() => Category)
  declare category: Category;

  @HasMany(() => SubCategoryTranslation)
  translations: SubCategoryTranslation[];

  @HasOne(() => SubCategoryTranslation)
  translation: SubCategoryTranslation;

  @HasMany(() => Place)
  places: Place[];
}
