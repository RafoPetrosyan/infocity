import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../swagger/api-docs';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiEndpoint('List notifications', { auth: 'required', roles: ['user'] })
  async findAll(@Req() req: any, @Query() query: QueryNotificationsDto) {
    const userId = req.user.sub;
    return this.notificationsService.findAll(userId, query);
  }

  @Get('unread-count')
  @ApiEndpoint('Get the unread notification count', {
    auth: 'required',
    roles: ['user'],
  })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.sub;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiEndpoint('Mark a notification as read', {
    auth: 'required',
    roles: ['user'],
  })
  @ApiParam({ name: 'id', type: Number })
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.notificationsService.markAsRead(userId, parseInt(id));
  }

  @Post('read-all')
  @ApiEndpoint('Mark all notifications as read', {
    auth: 'required',
    roles: ['user'],
  })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.sub;
    return this.notificationsService.markAllAsRead(userId);
  }
}
