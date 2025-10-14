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
  tableName: 'user_contacts',
})
export class UserContact extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare contact_id: number;

  @Column({
    type: DataType.ENUM('pending', 'accepted'),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: 'pending' | 'accepted';

  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'user' })
  declare user: User;

  @BelongsTo(() => User, { foreignKey: 'contact_id', as: 'contact' })
  declare contact: User;
}

