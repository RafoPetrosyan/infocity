import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'verifications', timestamps: true })
export class Verification extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  code: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_forgot_password: boolean;

  @Column({
    type: DataType.ENUM('email', 'phone'),
    allowNull: false,
    defaultValue: 'email',
  })
  type: 'email' | 'phone';

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expires_at: Date;

  @BelongsTo(() => User)
  user: User;
}
