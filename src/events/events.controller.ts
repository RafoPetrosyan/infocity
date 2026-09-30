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
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint, ApiFileBody, ApiMultipart } from '../swagger/api-docs';
import {
  CreateEventMultipartDto,
  multipartObjectDescription,
  UpdateEventMultipartDto,
} from '../swagger/multipart-bodies.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiEndpoint('List events', { auth: 'optional' })
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
  @ApiEndpoint('List events the current user is going to', {
    auth: 'required',
    roles: ['user'],
  })
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
  @ApiEndpoint('List event invitations for the current user', {
    auth: 'required',
    roles: ['user'],
  })
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

  @Get('by-alias/:alias')
  @ApiEndpoint('Get an event by alias', { auth: 'optional' })
  @ApiParam({ name: 'alias', type: String })
  @UseGuards(OptionalJwtAuthGuard)
  getByAlias(
    @Param('alias') alias: string,
    @I18nLang() lang: LanguageEnum,
    @Req() req: any,
  ) {
    const userId = req?.user?.sub;
    return this.eventsService.getByAlias(alias, lang, userId);
  }

  @Get('/:id')
  @ApiEndpoint('Get an event by id', { auth: 'optional' })
  @ApiParam({ name: 'id', type: Number })
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
  @ApiEndpoint('Get full event details', { auth: 'optional' })
  @ApiParam({ name: 'id', type: Number })
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
  @ApiEndpoint('Create an event', {
    auth: 'required',
    roles: ['user'],
    description: multipartObjectDescription,
  })
  @ApiMultipart(CreateEventMultipartDto, multipartObjectDescription)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages([{ name: 'image', maxCount: 1, withThumb: true }], {
      folder: 'events/tmp',
      folderResolver: (req) =>
        req.body?.place_id
          ? `places/${req.body.place_id}/events`
          : 'events/tmp',
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
  @ApiEndpoint('Update an event', {
    auth: 'required',
    roles: ['user', 'super-admin', 'admin'],
    description: multipartObjectDescription,
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiMultipart(UpdateEventMultipartDto, multipartObjectDescription)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  @UseInterceptors(
    UploadAndOptimizeImages([{ name: 'image', maxCount: 1, withThumb: true }], {
      folder: 'events/tmp',
      folderResolver: (req) =>
        req.body?.place_id
          ? `places/${req.body.place_id}/events`
          : `events/${req.params.id}`,
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
  @ApiEndpoint('Upload event gallery images', {
    auth: 'required',
    roles: ['user', 'super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiFileBody(
    { images: { multiple: true, required: true } },
    'Up to 15 gallery images.',
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  @UseInterceptors(
    UploadAndOptimizeImages(
      [{ name: 'images', maxCount: 15, withThumb: true }],
      { folder: 'events/gallery', folderResolver: (req) => `events/${req.params.id}/gallery` },
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
  @ApiEndpoint('Delete an event gallery image', {
    auth: 'required',
    roles: ['user', 'super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'imageId', type: Number })
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
  @ApiEndpoint('Delete an event', {
    auth: 'required',
    roles: ['user', 'super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  async delete(@Req() req: any, @Param('id') id: number) {
    const userId = req.user.sub;

    return this.eventsService.delete(userId, id);
  }

  @Get(':id/gallery')
  @ApiEndpoint('List event gallery images')
  @ApiParam({ name: 'id', type: Number })
  async getGallery(@Param('id') id: number) {
    return this.eventsService.getImages(id);
  }

  @Post(':id/invite')
  @ApiEndpoint('Invite a user to an event', {
    auth: 'required',
    roles: ['user'],
  })
  @ApiParam({ name: 'id', type: Number })
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
  @ApiEndpoint('Toggle going to an event', {
    auth: 'required',
    roles: ['user'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async toggleGoing(@Req() req: any, @Param('id') eventId: number) {
    const userId = req.user.sub;
    return this.eventsService.toggleGoing(userId, eventId);
  }

  @Post('invitations/:invitationId/accept')
  @ApiEndpoint('Accept an event invitation', {
    auth: 'required',
    roles: ['user'],
  })
  @ApiParam({ name: 'invitationId', type: Number })
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
  @ApiEndpoint('Reject an event invitation', {
    auth: 'required',
    roles: ['user'],
  })
  @ApiParam({ name: 'invitationId', type: Number })
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
  @ApiEndpoint('List users going to an event')
  @ApiParam({ name: 'id', type: Number })
  async getEventGoings(@Param('id') eventId: number, @Query() query: QueryDto) {
    return this.eventsService.getEventGoings(eventId, query);
  }
}
