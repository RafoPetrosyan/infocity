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
import { DOMAIN_URL } from '../../../constants';
import { Place } from '../../places/models/places.model';
import { Category } from './category.model';

@Table({ tableName: 'sub_categories' })
export class SubCategory extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare slug: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('image');
      return rawValue ? `${DOMAIN_URL}/uploads/sub-categories/${rawValue}` : null;
    },
  })
  declare image: string;

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
