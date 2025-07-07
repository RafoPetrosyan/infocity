import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { CityTranslation } from './city-translation.model';
import { ProvinceModel } from './province.model';

@Table({ tableName: 'cities' })
export class CityModel extends Model {
  @ForeignKey(() => ProvinceModel)
  @Column({ type: DataType.INTEGER })
  province_id: number;

  @BelongsTo(() => ProvinceModel)
  province: ProvinceModel;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  slug: string;

  @HasMany(() => CityTranslation)
  translations: CityTranslation[];
}
