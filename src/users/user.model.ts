import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  static hashPassword(plain: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(plain).digest('hex');
  }

  @Column({ type: DataType.STRING, allowNull: false })
  first_name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  last_name: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  // @Column({ type: DataType.STRING })
  // phone: string;

  @Column({
    type: DataType.STRING,
    set(this: User, value: string) {
      if (value) {
        this.setDataValue('password', User.hashPassword(value));
      }
    },
    get(this: User) {
      // hide password from being returned in queries
      return undefined;
    },
  })
  password: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  verified: boolean;

  @Column({ type: DataType.STRING })
  avatar: string;

  @Column({
    type: DataType.ENUM('email', 'google', 'facebook'),
    defaultValue: 'email',
  })
  login_type: 'email' | 'google' | 'facebook';

  @Column({
    type: DataType.ENUM('user', 'admin', 'super-admin', 'business'),
    defaultValue: 'user',
  })
  role: 'user' | 'admin' | 'super-admin' | 'business';
}
