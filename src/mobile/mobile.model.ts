import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'mobile_versions', timestamps: true })
export class MobileVersion extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: '1.0.0',
  })
  ios_version: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: '1.0.0',
  })
  android_version: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  force_update: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  app_working: boolean;
}
