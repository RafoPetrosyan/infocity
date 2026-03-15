import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Item } from './items.model';
import { DOMAIN_URL } from '../../../constants';

@Table({ tableName: 'item_images', timestamps: false })
export class ItemImages extends Model {
  @ForeignKey(() => Item)
  @Column({ type: DataType.INTEGER })
  declare item_id: number;

  @BelongsTo(() => Item)
  declare item: Item;

  @Column({
    type: DataType.ENUM('image', 'video'),
    defaultValue: 'image',
  })
  declare type: 'image' | 'video';

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('original');
      if (!rawValue) return null;
      if (rawValue.startsWith('https://') || rawValue.startsWith('http://')) return rawValue;
      return `${DOMAIN_URL}/uploads/items/${rawValue}`;
    },
  })
  declare original: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('thumbnail');
      if (!rawValue) return null;
      if (rawValue.startsWith('https://') || rawValue.startsWith('http://')) return rawValue;
      return `${DOMAIN_URL}/uploads/items/${rawValue}`;
    },
  })
  declare thumbnail: string;
}


