import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

@Table({
  tableName: 'notifications',
  timestamps: true,
})
export class Notification extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @Column({ type: DataType.STRING(64), allowNull: false })
  declare type: string;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare reference_type: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare reference_id: number | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare title: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare body: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare read: boolean;

  @BelongsTo(() => User)
  declare user: User;
}
