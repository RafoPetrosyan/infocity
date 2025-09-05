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
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import {
  CategoryTranslationDto,
  CreateCategoryDto,
} from './dto/create-category.dto';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BulkUpdateOrderDto } from '../emotions/dto/update-order.dto';
import { unlink } from 'fs/promises';
import { UploadFile } from '../../utils/upload.helper';

@Controller('categories')
export class PlacesController {
  constructor(private readonly categoriesService: PlacesService) {}

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
  // @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('super-admin', 'admin')
  // @UseInterceptors(UploadFile('image', './uploads/categories'))
  // async create(
  //   @Body() dto: CreateCategoryDto,
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
  //   return this.categoriesService.create(
  //     dto,
  //     translations,
  //     image?.filename,
  //     image?.path,
  //   );
  // }
  //
  // @Put(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('super-admin', 'admin')
  // @UseInterceptors(UploadFile('image', './uploads/categories'))
  // async update(
  //   @Param('id') id: number,
  //   @Body() dto: CreateCategoryDto,
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
