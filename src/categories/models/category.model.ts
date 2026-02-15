import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { CategoryTranslation } from './category-translation.model';
import { SubCategory } from './sub-category.model';
import { DOMAIN_URL } from '../../../constants';
import { Place } from '../../places/models/places.model';

@Table({ tableName: 'categories' })
export class Category extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare slug: string;

  @Column({
    type: DataType.STRING,

    get() {
      const rawValue = this.getDataValue('image');
      return rawValue ? `${DOMAIN_URL}/uploads/categories/${rawValue}` : null;
    },
  })
  declare image: string;

  @Column({ type: DataType.INTEGER })
  declare order: number;

  @HasMany(() => CategoryTranslation)
  translations: CategoryTranslation[];

  @HasOne(() => CategoryTranslation)
  translation: CategoryTranslation;

  @HasMany(() => SubCategory)
  sub_categories: SubCategory[];

  @HasMany(() => Place)
  places: Place[];
}
