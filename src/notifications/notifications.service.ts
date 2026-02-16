import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Notification } from './models/notification.model';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

export interface CreateNotificationDto {
  user_id: number;
  type: string;
  reference_type?: string | null;
  reference_id?: number | null;
  title?: string | null;
  body?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return this.notificationModel.create({
      user_id: dto.user_id,
      type: dto.type,
      reference_type: dto.reference_type ?? null,
      reference_id: dto.reference_id ?? null,
      title: dto.title ?? null,
      body: dto.body ?? null,
      read: false,
    });
  }

  async findAll(
    userId: number,
    query: QueryNotificationsDto,
  ): Promise<{
    data: Notification[];
    meta: { total: number; page: number; limit: number; pages_count: number };
  }> {
    const { page = 1, limit = 10, read } = query;
    const offset = (page - 1) * limit;

    const where: any = { user_id: userId };
    if (read !== undefined) {
      where.read = read;
    }

    const { count, rows } = await this.notificationModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }

  async markAsRead(userId: number, notificationId: number): Promise<Notification> {
    const notification = await this.notificationModel.findOne({
      where: { id: notificationId, user_id: userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.read = true;
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId: number): Promise<{ message: string }> {
    await this.notificationModel.update(
      { read: true },
      { where: { user_id: userId, read: false } },
    );
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.notificationModel.count({
      where: { user_id: userId, read: false },
    });
    return { count };
  }
}
