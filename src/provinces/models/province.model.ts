import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { ProvinceTranslation } from './province-translation.model';
import { CityModel } from './city.model';

@Table({ tableName: 'provinces' })
export class ProvinceModel extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  slug: string;

  @HasMany(() => ProvinceTranslation)
  translations: ProvinceTranslation[];

  @HasMany(() => CityModel)
  cities: CityModel[];
}
