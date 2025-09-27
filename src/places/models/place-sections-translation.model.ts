import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { PlaceSection } from './place-sections.model';
import { LanguageEnum } from '../../../types';

@Table({ tableName: 'place_section_translations', timestamps: false })
export class PlaceSectionTranslation extends Model {
  @ForeignKey(() => PlaceSection)
  @Column({ type: DataType.INTEGER })
  declare place_section_id: number;

  @BelongsTo(() => PlaceSection)
  declare place_section: PlaceSection;

  @Index
  @Column({
    type: DataType.ENUM(...Object.values(LanguageEnum)),
    allowNull: false,
  })
  declare language: LanguageEnum;

  @Column({ type: DataType.STRING })
  declare title: string;

  @Column({ type: DataType.STRING })
  declare description: string;
}


