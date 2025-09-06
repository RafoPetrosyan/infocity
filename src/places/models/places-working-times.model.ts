import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Place } from './places.model';

@Table({ tableName: 'place_working_times', timestamps: false })
export class PlaceWorkingTimes extends Model {
  @ForeignKey(() => Place)
  @Column({ type: DataType.INTEGER, allowNull: false })
  place_id: number;

  @BelongsTo(() => Place)
  place: Place;

  @Column({
    type: DataType.ENUM(
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ),
    allowNull: false,
  })
  weekday: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  start_time: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  end_time: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_working_day: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  breaks: { start: string; end: string }[];
}
