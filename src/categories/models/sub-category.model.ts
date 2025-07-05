import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { SubCategoryTranslation } from './sub-category-translation.model';
import { Category } from './category.model';

@Table({ tableName: 'sub_categories' })
export class SubCategory extends Model {
  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER })
  category_id: number;

  @BelongsTo(() => Category)
  category: Category;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  slug: string;

  @HasMany(() => SubCategoryTranslation)
  translations: SubCategoryTranslation[];
}
