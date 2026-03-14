import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Put,
  Param,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import {
  CreateSubCategoryDto,
  SubCategoryTranslationDto,
} from './dto/create-sub-category.dto';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BulkUpdateOrderDto } from '../emotions/dto/update-order.dto';

@Controller('sub-categories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get('/')
  getAll(@I18nLang() lang: string) {
    return this.subcategoriesService.getAll(lang);
  }

  @Get('/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  getAllForAdmin(@Query('category_id') categoryId?: string) {
    return this.subcategoriesService.getAllAdmin(
      categoryId ? Number(categoryId) : undefined,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async create(@Body() dto: CreateSubCategoryDto) {
    let translations: SubCategoryTranslationDto[] = [];

    try {
      translations = JSON.parse(dto.translations);
    } catch (e) {
      throw new BadRequestException('Invalid translations format');
    }

    return this.subcategoriesService.create(dto, translations);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async update(
    @Param('id') id: number,
    @Body() dto: CreateSubCategoryDto,
  ) {
    let translations: SubCategoryTranslationDto[] = [];

    try {
      translations = JSON.parse(dto.translations);
    } catch (e) {
      throw new BadRequestException('Invalid translations format');
    }

    return this.subcategoriesService.update(Number(id), dto, translations);
  }

  @Post('/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async updateOrder(@Body() dto: BulkUpdateOrderDto) {
    return this.subcategoriesService.updateOrdering(dto.items);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async delete(@Param('id') id: number) {
    return this.subcategoriesService.delete(Number(id));
  }
}
