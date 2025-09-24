import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { Item } from './items.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'item_translations', timestamps: false })
export class ItemTranslation extends Model {
  @ForeignKey(() => Item)
  @Column({ type: DataType.INTEGER })
  declare item_id: number;

  @BelongsTo(() => Item)
  declare item: Item;

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


