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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  CategoryTranslationDto,
  CreateCategoryDto,
} from './dto/create-category.dto';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BulkUpdateOrderDto } from '../emotions/dto/update-order.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../swagger/api-docs';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/')
  @ApiEndpoint('List categories')
  getAll(@I18nLang() lang: string) {
    return this.categoriesService.getAll(lang);
  }

  @Get('/admin')
  @ApiEndpoint('List categories for admin', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  getAllForAdmin() {
    return this.categoriesService.getAllAdmin();
  }

  @Post()
  @ApiEndpoint('Create a category', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async create(@Body() dto: CreateCategoryDto) {
    let translations: CategoryTranslationDto[] = [];

    try {
      translations = JSON.parse(dto.translations);
    } catch (e) {
      throw new BadRequestException('Invalid translations format');
    }

    return this.categoriesService.create(dto, translations);
  }

  @Put(':id')
  @ApiEndpoint('Update a category', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async update(
    @Param('id') id: number,
    @Body() dto: CreateCategoryDto,
  ) {
    let translations: CategoryTranslationDto[] = [];

    try {
      translations = JSON.parse(dto.translations);
    } catch (e) {
      throw new BadRequestException('Invalid translations format');
    }

    return this.categoriesService.update(id, dto, translations);
  }

  @Post('/order')
  @ApiEndpoint('Reorder categories', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async updateOrder(@Body() dto: BulkUpdateOrderDto) {
    return this.categoriesService.updateOrdering(dto.items);
  }

  @Delete(':id')
  @ApiEndpoint('Delete a category', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async delete(@Param('id') id: number) {
    return this.categoriesService.delete(id);
  }
}
