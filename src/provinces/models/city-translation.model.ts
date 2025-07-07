import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { CityModel } from './city.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'city_translations' })
export class CityTranslation extends Model {
  @ForeignKey(() => CityModel)
  @Column({ type: DataType.INTEGER })
  city_id: number;

  @BelongsTo(() => CityModel)
  city: CityModel;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  language: LanguageEnum;

  @Column({ type: DataType.STRING })
  name: string;
}
