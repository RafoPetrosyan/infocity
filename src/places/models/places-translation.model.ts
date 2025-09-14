import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { Place } from './places.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'place_translations', timestamps: false })
export class PlaceTranslation extends Model {
  @ForeignKey(() => Place)
  @Column({ type: DataType.INTEGER })
  declare place_id: number;

  @BelongsTo(() => Place)
  declare place: Place;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  declare language: LanguageEnum;

  @Column({ type: DataType.STRING })
  declare name: string;

  @Column({ type: DataType.STRING })
  declare description: string;

  @Column({ type: DataType.TEXT })
  declare about: string;
}
