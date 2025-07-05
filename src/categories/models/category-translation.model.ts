import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { Category } from './category.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'category_translations' })
export class CategoryTranslation extends Model {
  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER })
  category_id: number;

  @BelongsTo(() => Category)
  category: Category;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  language: LanguageEnum;

  @Column({ type: DataType.STRING })
  title: string;
}
