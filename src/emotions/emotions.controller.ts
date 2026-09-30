import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { EmotionsService } from './emotions.service';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { BulkUpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../swagger/api-docs';

@ApiTags('Emotions')
@Controller('emotions')
export class EmotionsController {
  constructor(private readonly emotionsService: EmotionsService) {}

  @Get('/')
  @ApiEndpoint('List emotions')
  getAll(@I18nLang() lang: string) {
    return this.emotionsService.getAll(lang);
  }

  @Get('/admin')
  @ApiEndpoint('List emotions for admin', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  getAllForAdmin() {
    return this.emotionsService.getAllAdmin();
  }

  @Post()
  @ApiEndpoint('Create an emotion', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async create(@Body() dto: CreateEmotionDto) {
    return this.emotionsService.create(dto);
  }

  @Put(':id')
  @ApiEndpoint('Update an emotion', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async update(@Param('id') id: number, @Body() dto: CreateEmotionDto) {
    return this.emotionsService.update(id, dto);
  }

  @Post('/order')
  @ApiEndpoint('Reorder emotions', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async updateOrder(@Body() dto: BulkUpdateOrderDto) {
    return this.emotionsService.updateOrdering(dto.items);
  }

  @Delete(':id')
  @ApiEndpoint('Delete an emotion', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async delete(@Param('id') id: number) {
    return this.emotionsService.delete(id);
  }
}
