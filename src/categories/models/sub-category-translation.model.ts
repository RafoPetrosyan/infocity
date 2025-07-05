import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { SubCategory } from './sub-category.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'sub_category_translations' })
export class SubCategoryTranslation extends Model {
  @ForeignKey(() => SubCategory)
  @Column({ type: DataType.INTEGER })
  sub_category_id: number;

  @BelongsTo(() => SubCategory)
  sub_category: SubCategory;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  language: LanguageEnum;

  @Column({ type: DataType.STRING })
  title: string;
}
