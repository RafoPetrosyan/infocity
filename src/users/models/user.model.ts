import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import { CityModel } from '../../cities/models/city.model';
import { EmotionsModel } from '../../emotions/models/emotions.model';
import { UserEmotions } from './user-emotions.model';
import { DOMAIN_URL } from '../../../constants';
import { Place } from '../../places/models/places.model';
import { UserFollow } from '../../follows/models/user-follow.model';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare first_name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare last_name: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING })
  declare password: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare phone_verified: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare email_verified: boolean;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('avatar');

      if (rawValue && !rawValue.startsWith('http')) {
        return `${DOMAIN_URL}/uploads/avatars/${rawValue}`;
      }

      return rawValue;
    },
  })
  declare avatar: string;

  @Column({ type: DataType.STRING(30) })
  declare phone_number: string;

  @Column({
    type: DataType.ENUM('email', 'google', 'facebook', 'apple', 'phone'),
    defaultValue: 'email',
  })
  declare login_type: 'email' | 'google' | 'facebook' | 'apple' | 'phone';

  @Column({
    type: DataType.ENUM('user', 'admin', 'super-admin'),
    defaultValue: 'user',
  })
  declare role: 'user' | 'admin' | 'super-admin';

  @Column({
    type: DataType.ENUM('hy', 'en', 'ru'),
  })
  declare locale: 'hy' | 'en' | 'ru' | null;

  @Column({ type: DataType.STRING })
  declare refresh_token: string;

  @Column({ type: DataType.STRING })
  declare fcm_token: string;

  @Column({ type: DataType.DECIMAL(10, 8) })
  declare latitude: number;

  @Column({ type: DataType.DECIMAL(11, 8) })
  declare longitude: number;

  @Column({ type: DataType.GEOMETRY('POINT') })
  declare location: { type: 'Point'; coordinates: [number, number] };

  @ForeignKey(() => CityModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare city_id: number;

  @BelongsTo(() => CityModel)
  declare city: CityModel;

  @HasMany(() => Place, { foreignKey: 'user_id', as: 'places' })
  places: Place[];

  @BelongsToMany(() => EmotionsModel, () => UserEmotions)
  declare emotions: EmotionsModel[];

  @HasMany(() => UserFollow)
  declare follows: UserFollow[];

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
    console.log(plain, hash);
    console.log(JSON.stringify(plain));
    return await bcrypt.compare(plain, hash);
  }

  toJSON() {
    const values = { ...this.get() };
    // @ts-ignore
    delete values.password;
    delete values.refresh_token;

    return values;
  }
}
