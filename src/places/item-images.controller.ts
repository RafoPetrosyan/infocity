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

@Controller('places/:placeId/items/:itemId/images')
export class ItemImagesController {
  constructor(private readonly itemImagesService: ItemImagesService) {}

  @Get('/')
  list(@Param('placeId') placeId: number, @Param('itemId') itemId: number) {
    return this.itemImagesService.list(Number(placeId), Number(itemId));
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages(
      [{ name: 'images', maxCount: 10, withThumb: true }],
      { folder: './uploads/items' },
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
