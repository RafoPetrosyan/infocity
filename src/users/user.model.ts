import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({ type: DataType.STRING, allowNull: false })
  first_name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  last_name: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING })
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

  @BeforeCreate
  @BeforeUpdate
  static async hashPasswordHook(instance: User) {
    if (instance.changed('password')) {
      instance.password = await bcrypt.hash(instance.password, 10);
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async comparePasswords(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }

  toJSON() {
    const values = { ...this.get() };
    // @ts-ignore
    delete values.password;

    if (values.avatar) {
      values.avatar = `${process.env.DOMAIN_URL}/${values.avatar}`;
    }

    return values;
  }
}
