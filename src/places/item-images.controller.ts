import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ItemImagesService } from './item-images.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UploadAndOptimizeImages } from '../../utils/upload-and-optimize.helper';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint, ApiFileBody } from '../swagger/api-docs';

@ApiTags('Place item images')
@Controller('places/:placeId/items/:itemId/images')
export class ItemImagesController {
  constructor(private readonly itemImagesService: ItemImagesService) {}

  @Get('/')
  @ApiEndpoint('List images for a place item')
  @ApiParam({ name: 'placeId', type: Number })
  @ApiParam({ name: 'itemId', type: Number })
  list(@Param('placeId') placeId: number, @Param('itemId') itemId: number) {
    return this.itemImagesService.list(Number(placeId), Number(itemId));
  }

  @Post('/')
  @ApiEndpoint('Upload images for a place item', {
    auth: 'required',
    roles: ['user'],
  })
  @ApiParam({ name: 'placeId', type: Number })
  @ApiParam({ name: 'itemId', type: Number })
  @ApiFileBody(
    { images: { multiple: true, required: true } },
    'Up to 10 item images.',
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages(
      [{ name: 'images', maxCount: 10, withThumb: true }],
      {
        folder: 'places/tmp/items/gallery',
        folderResolver: (req) =>
          `places/${req.params.placeId}/items/${req.params.itemId}/gallery`,
      },
    ),
  )
  create(
    @Req() req: any,
    @Param('placeId') placeId: number,
    @Param('itemId') itemId: number,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    return this.itemImagesService.create(
      req.user.sub,
      Number(placeId),
      Number(itemId),
      files,
    );
  }

  @Delete('/:imageId')
  @ApiEndpoint('Delete a place item image', {
    auth: 'required',
    roles: ['user'],
  })
  @ApiParam({ name: 'placeId', type: Number })
  @ApiParam({ name: 'itemId', type: Number })
  @ApiParam({ name: 'imageId', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  remove(
    @Req() req: any,
    @Param('placeId') placeId: number,
    @Param('itemId') itemId: number,
    @Param('imageId') imageId: number,
  ) {
    return this.itemImagesService.remove(
      req.user.sub,
      Number(placeId),
      Number(itemId),
      Number(imageId),
    );
  }
}
