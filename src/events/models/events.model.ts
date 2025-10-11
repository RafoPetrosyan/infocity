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
import { EventTranslation } from './events-translation.model';
import { EventImages } from './events-images.model';
import { EventCategory } from './event-category.model';
import { DOMAIN_URL } from '../../../constants';
import { Place } from '../../places/models/places.model';
import { User } from '../../users/models/user.model';
import { UserFollow } from '../../follows/models/user-follow.model';
import { Review } from '../../reviews/models/review.model';
import { EntityEmotionCounts } from '../../reviews/models/entity-emotion-counts.model';

@Table({ tableName: 'events' })
export class Event extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare slug: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('image');
      return rawValue ? `${DOMAIN_URL}/uploads/events/${rawValue}` : null;
    },
  })
  declare image: string;

  @Column({
    type: DataType.STRING,
    get() {
      const rawValue = this.getDataValue('image_original');
      return rawValue ? `${DOMAIN_URL}/uploads/events/${rawValue}` : null;
    },
  })
  declare image_original: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare start_date: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare end_date: Date;

  @Column({ type: DataType.DECIMAL(10, 8), allowNull: true })
  declare latitude: number;

  @Column({ type: DataType.DECIMAL(11, 8), allowNull: true })
  declare longitude: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare address: string;

  @Column({ type: DataType.GEOMETRY('POINT'), allowNull: true })
  declare location: { type: 'Point'; coordinates: [number, number] };

  @Column({ type: DataType.STRING, allowNull: true })
  declare email: string;

  @Column({ type: DataType.STRING(30), allowNull: true })
  declare phone_number: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  declare price: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare max_attendees: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare is_featured: boolean;

  @ForeignKey(() => Place)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare place_id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare user_id: number;

  @ForeignKey(() => EventCategory)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare event_category_id: number;

  @BelongsTo(() => Place)
  declare place: Place;

  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'owner' })
  declare owner: User;

  @BelongsTo(() => EventCategory)
  declare event_category: EventCategory;

  @HasMany(() => EventTranslation)
  declare translations: EventTranslation[];

  @HasOne(() => EventTranslation)
  declare translation: EventTranslation;

  @HasMany(() => EventImages)
  declare gallery: EventImages[];

  @HasMany(() => UserFollow, {
    foreignKey: 'entity_id',
    constraints: false,
    scope: {
      followable_type: 'event',
    },
  })
  declare followers: UserFollow[];

  @HasMany(() => Review, {
    foreignKey: 'entity_id',
    constraints: false,
    scope: {
      entity_type: 'event',
    },
  })
  declare reviews: Review[];

  @HasMany(() => EntityEmotionCounts, {
    foreignKey: 'entity_id',
    constraints: false,
    scope: {
      entity_type: 'event',
    },
  })
  declare emotions: EntityEmotionCounts[];
}
