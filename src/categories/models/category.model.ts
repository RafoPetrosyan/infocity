import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { CategoryTranslation } from './category-translation.model';
import { SubCategory } from './sub-category.model';

@Table({ tableName: 'categories' })
export class Category extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  slug: string;

  @HasMany(() => CategoryTranslation)
  translations: CategoryTranslation[];

  @HasMany(() => SubCategory)
  sub_categories: SubCategory[];
}
