import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { QueryDto } from '../../types/query.dto';
import { ItemsService } from './items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateItemDto, UpdateItemDto } from './dto/create-item.dto';
import { UploadAndOptimizeImages } from '../../utils/upload-and-optimize.helper';
import { I18nLang } from 'nestjs-i18n';
import { LanguageEnum } from '../../types';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint, ApiMultipart } from '../swagger/api-docs';
import {
  CreateItemMultipartDto,
  multipartObjectDescription,
  UpdateItemMultipartDto,
} from '../swagger/multipart-bodies.dto';

@ApiTags('Place items')
@Controller('places/:placeId/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('/')
  @ApiEndpoint('List items in a place')
  @ApiParam({ name: 'placeId', type: Number })
  list(
    @Param('placeId') placeId: number,
    @I18nLang() lang: LanguageEnum,
    @Query() query?: QueryDto,
  ) {
    return this.itemsService.list(Number(placeId), lang, query);
  }

  @Get('/:itemId')
  @ApiEndpoint('Get a place item')
  @ApiParam({ name: 'placeId', type: Number })
  @ApiParam({ name: 'itemId', type: Number })
  getById(
    @Param('placeId') placeId: number,
    @Param('itemId') itemId: number,
    @I18nLang() lang: LanguageEnum,
  ) {
    return this.itemsService.getById(Number(placeId), Number(itemId), lang);
  }

  @Post('/')
  @ApiEndpoint('Create a place item', {
    auth: 'required',
    roles: ['user'],
    description: multipartObjectDescription,
  })
  @ApiParam({ name: 'placeId', type: Number })
  @ApiMultipart(CreateItemMultipartDto, multipartObjectDescription)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages([{ name: 'image', maxCount: 1, withThumb: true }], {
      folder: 'places/tmp/items',
      folderResolver: (req) => `places/${req.params.placeId}/items`,
    }),
  )
  create(
    @Req() req: any,
    @Param('placeId') placeId: number,
    @Body() dto: CreateItemDto,
    @UploadedFiles() files?: { image?: Express.Multer.File[] },
  ) {
    const image = files?.image?.[0];
    const payload = image ? { image } : undefined;
    return this.itemsService.create(
      req.user.sub,
      Number(placeId),
      dto,
      payload as any,
    );
  }

  @Put('/:itemId')
  @ApiEndpoint('Update a place item', {
    auth: 'required',
    roles: ['user'],
    description: multipartObjectDescription,
  })
  @ApiParam({ name: 'placeId', type: Number })
  @ApiParam({ name: 'itemId', type: Number })
  @ApiMultipart(UpdateItemMultipartDto, multipartObjectDescription)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages([{ name: 'image', maxCount: 1, withThumb: true }], {
      folder: 'places/tmp/items',
      folderResolver: (req) => `places/${req.params.placeId}/items`,
    }),
  )
  update(
    @Req() req: any,
    @Param('placeId') placeId: number,
    @Param('itemId') itemId: number,
    @Body() dto: UpdateItemDto,
    @UploadedFiles() files?: { image?: Express.Multer.File[] },
  ) {
    const image = files?.image?.[0];
    const payload = image ? { image } : undefined;
    return this.itemsService.update(
      req.user.sub,
      Number(placeId),
      Number(itemId),
      dto,
      payload as any,
    );
  }

  @Delete('/:itemId')
  @ApiEndpoint('Delete a place item', { auth: 'required', roles: ['user'] })
  @ApiParam({ name: 'placeId', type: Number })
  @ApiParam({ name: 'itemId', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  remove(
    @Req() req: any,
    @Param('placeId') placeId: number,
    @Param('itemId') itemId: number,
  ) {
    return this.itemsService.remove(
      req.user.sub,
      Number(placeId),
      Number(itemId),
    );
  }
}
