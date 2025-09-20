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
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UploadAndOptimizeImages } from '../../utils/upload-and-optimize.helper';
import {
  CreateWorkingTimeDto,
  CreateWorkingTimesDto,
} from './dto/create-working-times.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { QueryDto } from '../../types/query.dto';
import { LanguageEnum } from '../../types';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CreateAttractionDto } from './dto/create-attraction.dto';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('/attractions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  getAll(@Query() params: QueryDto) {
    return this.placesService.getAttractionsForAdmin(params);
  }

  @Get('/:id')
  @UseGuards(OptionalJwtAuthGuard)
  getById(
    @Param('id') id: number,
    @I18nLang() lang: LanguageEnum,
    @Req() req: any,
  ) {
    const userId = req?.user?.sub;
    return this.placesService.getById(id, lang, userId);
  }

  @Get('/:id/detail')
  @UseGuards(OptionalJwtAuthGuard)
  getByIdDetail(
    @Param('id') id: number,
    @I18nLang() lang: LanguageEnum,
    @Req() req: any,
  ) {
    const userId = req?.user?.sub;
    return this.placesService.getPlaceByIdAllData(id, userId, lang);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages(
      [
        { name: 'image', maxCount: 1, withThumb: true },
        { name: 'logo', maxCount: 1, withThumb: false, qualityValue: 80 },
      ],
      { folder: './uploads/places' },
    ),
  )
  async create(
    @Req() req: any,
    @Body() body: CreatePlaceDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      logo?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;

    const cover: any = files?.image?.[0];
    const logo: any = files?.logo?.[0];

    return this.placesService.create(userId, body, {
      coverOriginalName: cover?.filename,
      coverOriginalPath: cover?.path,
      coverThumbName: cover?.thumbFilename,
      coverThumbPath: cover?.thumbPath,
      logoFileName: logo?.filename,
      logoFilePath: logo?.path,
    });
  }

  @Post('/attraction')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @UseInterceptors(
    UploadAndOptimizeImages([{ name: 'image', maxCount: 1, withThumb: true }], {
      folder: './uploads/places',
    }),
  )
  async createAttraction(
    @Req() req: any,
    @Body() body: CreateAttractionDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;

    const cover: any = files?.image?.[0];

    return this.placesService.createAttraction(userId, body, {
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
    UploadAndOptimizeImages(
      [
        { name: 'image', maxCount: 1, withThumb: true },
        { name: 'logo', maxCount: 1, withThumb: false, qualityValue: 80 },
      ],
      { folder: './uploads/places' },
    ),
  )
  async update(
    @Req() req: any,
    @Body() body: UpdatePlaceDto,
    @Param('id') id: number,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      logo?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;

    const cover: any = files?.image?.[0];
    const logo: any = files?.logo?.[0];

    return this.placesService.update(userId, body, id, {
      coverOriginalName: cover?.filename,
      coverOriginalPath: cover?.path,
      coverThumbName: cover?.thumbFilename,
      coverThumbPath: cover?.thumbPath,
      logoFileName: logo?.filename,
      logoFilePath: logo?.path,
    });
  }

  @Put(':id/working-times')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  async createOrUpdateWorkingTimes(
    @Req() req: any,
    @Param('id') id: number,
    @Body() body: CreateWorkingTimesDto,
  ) {
    const userId = req.user.sub;

    return this.placesService.createOrUpdateWorkingTimes(userId, body, id);
  }

  @Put(':id/working-times/:timeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  async updateWorkingTime(
    @Req() req: any,
    @Param('id') id: number,
    @Param('timeId') timeId: number,
    @Body() body: CreateWorkingTimeDto,
  ) {
    const userId = req.user.sub;

    return this.placesService.updateWorkingTime(userId, body, id, timeId);
  }

  @Post(':id/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  @UseInterceptors(
    UploadAndOptimizeImages(
      [{ name: 'images', maxCount: 15, withThumb: true }],
      { folder: './uploads/places' },
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

    return this.placesService.uploadImages(userId, id, images, userRole);
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

    return this.placesService.deleteImage(userId, id, imageId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'super-admin', 'admin')
  async delete(@Req() req: any, @Param('id') id: number) {
    const userId = req.user.sub;

    return this.placesService.delete(userId, id);
  }

  @Get(':id/gallery')
  async getGallery(@Param('id') id: number) {
    return this.placesService.getImages(id);
  }
}
