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
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto, PlaceTranslationDto } from './dto/create-place.dto';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BulkUpdateOrderDto } from '../emotions/dto/update-order.dto';
import { unlink } from 'fs/promises';
import { UploadFile } from '../../utils/upload.helper';
import { UploadAndOptimizeImages } from '../../utils/upload-and-optimize.helper';
import { ParseJsonPipe } from '../../utils/custom-json-pipe';
import { instanceToPlain } from 'class-transformer';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  // @Get('/')
  // getAll(@I18nLang() lang: string) {
  //   return this.categoriesService.getAll(lang);
  // }
  //
  // @Get('/admin')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('super-admin', 'admin')
  // getAllForAdmin() {
  //   return this.categoriesService.getAllAdmin();
  // }
  //
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages(
      [
        { name: 'image', maxCount: 1, withThumb: true },
        { name: 'logo', maxCount: 1, withThumb: false },
      ],
      { folder: './uploads/places' },
    ),
  )
  async create(
    @Body() body: CreatePlaceDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      logo?: Express.Multer.File[];
    },
  ) {
    const cover: any = files?.image?.[0];
    const logo: any = files?.logo?.[0];

    return this.placesService.create(body, {
      coverOriginalName: cover?.filename,
      coverOriginalPath: cover?.path,
      coverThumbName: cover?.thumbFilename,
      coverThumbPath: cover?.thumbPath,
      logoFileName: logo?.filename,
      logoFilePath: logo?.path,
    });
  }
  //
  // @Put(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('super-admin', 'admin')
  // @UseInterceptors(UploadFile('image', './uploads/categories'))
  // async update(
  //   @Param('id') id: number,
  //   @Body() dto: CreatePlaceDto,
  //   @UploadedFile() image: Express.Multer.File,
  // ) {
  //   let translations: CategoryTranslationDto[] = [];
  //
  //   try {
  //     translations = JSON.parse(dto.translations);
  //   } catch (e) {
  //     if (image) await unlink(image.path);
  //     throw new BadRequestException('Invalid translations format');
  //   }
  //
  //   return this.categoriesService.update(
  //     id,
  //     dto,
  //     translations,
  //     image?.filename,
  //     image?.path,
  //   );
  // }
  //
  // @Post('/order')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('super-admin', 'admin')
  // async updateOrder(@Body() dto: BulkUpdateOrderDto) {
  //   return this.categoriesService.updateOrdering(dto.items);
  // }
  //
  // @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('super-admin', 'admin')
  // async delete(@Param('id') id: number) {
  //   return this.categoriesService.delete(id);
  // }
}
