import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { CityTranslation } from './city-translation.model';

@Table({ tableName: 'cities', timestamps: false })
export class CityModel extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare slug: string;

  @Column({ type: DataType.INTEGER })
  declare order: string;

  @HasMany(() => CityTranslation)
  declare translations: CityTranslation[];

  @HasOne(() => CityTranslation)
  declare translation: CityTranslation;
}
