import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { EventCategoriesService } from './event-categories.service';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventCategoryDto } from './dto/update-event-category.dto';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BulkUpdateOrderDto } from '../emotions/dto/update-order.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../swagger/api-docs';

import { LanguageEnum } from '../../types';

@ApiTags('Event categories')
@Controller('event-categories')
export class EventCategoriesController {
  constructor(
    private readonly eventCategoriesService: EventCategoriesService,
  ) {}

  @Get('/')
  @ApiEndpoint('List event categories')
  getAll(@I18nLang() lang: LanguageEnum) {
    return this.eventCategoriesService.getAll(lang);
  }

  @Get('/admin')
  @ApiEndpoint('List event categories for admin', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  getAllForAdmin() {
    return this.eventCategoriesService.getAllAdmin();
  }

  @Get(':id')
  @ApiEndpoint('Get an event category')
  @ApiParam({ name: 'id', type: Number })
  getById(@Param('id') id: number, @I18nLang() lang: LanguageEnum) {
    return this.eventCategoriesService.getById(id, lang);
  }

  @Post()
  @ApiEndpoint('Create an event category', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async create(@Body() dto: CreateEventCategoryDto) {
    return this.eventCategoriesService.create(dto);
  }

  @Put(':id')
  @ApiEndpoint('Update an event category', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async update(@Param('id') id: number, @Body() dto: UpdateEventCategoryDto) {
    return this.eventCategoriesService.update(id, dto);
  }

  @Post('/order')
  @ApiEndpoint('Reorder event categories', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async updateOrder(@Body() dto: BulkUpdateOrderDto) {
    return this.eventCategoriesService.updateOrdering(dto.items);
  }

  @Delete(':id')
  @ApiEndpoint('Delete an event category', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async delete(@Param('id') id: number) {
    return this.eventCategoriesService.delete(id);
  }
}




