import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Put,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Req,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UploadAndOptimizeImages } from '../../utils/upload-and-optimize.helper';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryDto } from '../../types/query.dto';
import { LanguageEnum } from '../../types';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { InviteToEventDto } from './dto/invite-to-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getAll(
    @Query() params: QueryDto,
    @I18nLang() lang: LanguageEnum,
    @Req() req: any,
  ) {
    const userId = req?.user?.sub;

    return this.eventsService.getAll(params, lang, userId);
  }

  @Get('goings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getMyGoings(
    @Query() query: QueryDto,
    @Req() req: any,
    @I18nLang() lang: LanguageEnum,
  ) {
    const userId = req.user.sub;
    return this.eventsService.getMyGoings(userId, query, lang);
  }

  @Get('invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getMyInvitations(
    @Query() query: QueryDto,
    @Req() req: any,
    @I18nLang() lang: LanguageEnum,
  ) {
    const userId = req.user.sub;
    return this.eventsService.getMyInvitations(userId, query, lang);
  }

  @Get('/:id')
  @UseGuards(OptionalJwtAuthGuard)
  getById(
    @Param('id') id: number,
    @I18nLang() lang: LanguageEnum,
    @Req() req: any,
  ) {
    const userId = req?.user?.sub;
    return this.eventsService.getById(id, lang, userId);
  }

  @Get('/:id/detail')
  @UseGuards(OptionalJwtAuthGuard)
  getByIdDetail(
    @Param('id') id: number,
    @I18nLang() lang: LanguageEnum,
    @Req() req: any,
  ) {
    const userId = req?.user?.sub;
    return this.eventsService.getEventByIdAllData(id, userId, lang);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages([{ name: 'image', maxCount: 1, withThumb: true }], {
      folder: './uploads/events',
    }),
  )
  async create(
    @Req() req: any,
    @Body() body: CreateEventDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;

    const cover: any = files?.image?.[0];

    return this.eventsService.create(userId, body, {
      coverOriginalName: cover?.filename,
      coverOriginalPath: cover?.path,
      coverThumbName: cover?.thumbFilename,
      coverThumbPath: cover?.thumbPath,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  @UseInterceptors(
    UploadAndOptimizeImages([{ name: 'image', maxCount: 1, withThumb: true }], {
      folder: './uploads/events',
    }),
  )
  async update(
    @Req() req: any,
    @Body() body: UpdateEventDto,
    @Param('id') id: number,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;

    const cover: any = files?.image?.[0];

    return this.eventsService.update(userId, body, id, {
      coverOriginalName: cover?.filename,
      coverOriginalPath: cover?.path,
      coverThumbName: cover?.thumbFilename,
      coverThumbPath: cover?.thumbPath,
    });
  }

  @Post(':id/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  @UseInterceptors(
    UploadAndOptimizeImages(
      [{ name: 'images', maxCount: 15, withThumb: true }],
      { folder: './uploads/events' },
    ),
  )
  async uploadImages(
    @Req() req: any,
    @Param('id') id: number,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const images: any = files?.images;

    return this.eventsService.uploadImages(userId, id, images, userRole);
  }

  @Delete(':id/gallery/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  async deleteImage(
    @Req() req: any,
    @Param('id') id: number,
    @Param('imageId') imageId: number,
  ) {
    const userId = req.user.sub;

    return this.eventsService.deleteImage(userId, id, imageId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  async delete(@Req() req: any, @Param('id') id: number) {
    const userId = req.user.sub;

    return this.eventsService.delete(userId, id);
  }

  @Get(':id/gallery')
  async getGallery(@Param('id') id: number) {
    return this.eventsService.getImages(id);
  }

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async inviteToEvent(
    @Req() req: any,
    @Param('id') eventId: number,
    @Body() dto: InviteToEventDto,
  ) {
    const userId = req.user.sub;
    return this.eventsService.sendInvitation(userId, eventId, dto);
  }

  @Post(':id/going')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async toggleGoing(@Req() req: any, @Param('id') eventId: number) {
    const userId = req.user.sub;
    return this.eventsService.toggleGoing(userId, eventId);
  }

  @Post('invitations/:invitationId/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async acceptInvitation(
    @Req() req: any,
    @Param('invitationId') invitationId: number,
  ) {
    const userId = req.user.sub;
    return this.eventsService.acceptInvitation(userId, invitationId);
  }

  @Post('invitations/:invitationId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async rejectInvitation(
    @Req() req: any,
    @Param('invitationId') invitationId: number,
  ) {
    const userId = req.user.sub;
    return this.eventsService.rejectInvitation(userId, invitationId);
  }

  @Get(':id/goings')
  async getEventGoings(@Param('id') eventId: number, @Query() query: QueryDto) {
    return this.eventsService.getEventGoings(eventId, query);
  }
}
