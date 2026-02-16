import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Event } from './events.model';

@Table({
  tableName: 'event_invitations',
  timestamps: true,
})
export class EventInvitation extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare inviter_id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare invitee_id: number;

  @ForeignKey(() => Event)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare event_id: number;

  @Column({
    type: DataType.ENUM('pending', 'accepted', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: 'pending' | 'accepted' | 'rejected';

  @BelongsTo(() => User, { foreignKey: 'inviter_id', as: 'inviter' })
  declare inviter: User;

  @BelongsTo(() => User, { foreignKey: 'invitee_id', as: 'invitee' })
  declare invitee: User;

  @BelongsTo(() => Event)
  declare event: Event;
}
