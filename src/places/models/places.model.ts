import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { PlaceTranslation } from './places-translation.model';
import { DOMAIN_URL } from '../../../constants';
import { CityModel } from '../../cities/models/city.model';
import { Category } from '../../categories/models/category.model';
import { PlaceImages } from './places-images.model';
import { PlaceWorkingTimes } from './places-working-times.model';
import { User } from '../../users/models/user.model';

@Table({ tableName: 'places' })
export class Place extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare slug: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('logo');
      return rawValue ? `${DOMAIN_URL}/uploads/places/${rawValue}` : null;
    },
  })
  declare logo: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('image');
      return rawValue ? `${DOMAIN_URL}/uploads/places/${rawValue}` : null;
    },
  })
  declare image: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('image_original');
      return rawValue ? `${DOMAIN_URL}/uploads/places/${rawValue}` : null;
    },
  })
  declare image_original: string;

  @Column({ type: DataType.DECIMAL(10, 8) })
  declare latitude: number;

  @Column({ type: DataType.DECIMAL(11, 8) })
  declare longitude: number;

  @Column({ type: DataType.GEOMETRY('POINT') })
  declare location: { type: 'Point'; coordinates: [number, number] };

  @Column({ type: DataType.JSONB, allowNull: true })
  declare social_links: { type: string; url: string }[];

  @ForeignKey(() => CityModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare city_id: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare category_id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @Column({ type: DataType.STRING })
  declare email: string;

  @Column({ type: DataType.STRING(30) })
  declare phone_number: string;

  @BelongsTo(() => CityModel)
  declare city: CityModel;

  @BelongsTo(() => Category)
  declare category: Category;

  @HasMany(() => PlaceTranslation)
  declare translations: PlaceTranslation[];

  @HasOne(() => PlaceTranslation)
  declare translation: PlaceTranslation;

  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'owner' })
  declare owner: User;

  @HasMany(() => PlaceImages)
  declare gallery: PlaceImages[];

  @HasMany(() => PlaceWorkingTimes)
  declare working_times: PlaceWorkingTimes[];
}
