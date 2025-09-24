import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { Menu } from './menus.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'menu_translations', timestamps: false })
export class MenuTranslation extends Model {
  @ForeignKey(() => Menu)
  @Column({ type: DataType.INTEGER })
  declare menu_id: number;

  @BelongsTo(() => Menu)
  declare menu: Menu;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  declare language: LanguageEnum;

  @Column({ type: DataType.STRING })
  declare title: string;

  @Column({ type: DataType.STRING })
  declare description: string;
}


