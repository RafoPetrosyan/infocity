import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { ProvinceModel } from './province.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'province_translations' })
export class ProvinceTranslation extends Model {
  @ForeignKey(() => ProvinceModel)
  @Column({ type: DataType.INTEGER })
  province_id: number;

  @BelongsTo(() => ProvinceModel)
  province: ProvinceModel;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  language: LanguageEnum;

  @Column({ type: DataType.STRING })
  name: string;
}
