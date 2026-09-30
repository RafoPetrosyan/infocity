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
import { CitiesService } from './cities.service';
import { BulkUpdateOrderDto } from '../emotions/dto/update-order.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../swagger/api-docs';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiEndpoint('List cities')
  getAll(@I18nLang() lang: string) {
    return this.citiesService.getAll(lang);
  }

  @Get('/admin')
  @ApiEndpoint('List cities for admin', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  getAllForAdmin() {
    return this.citiesService.getAllAdmin();
  }

  @Post()
  @ApiEndpoint('Create a city', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }

  @Put(':id')
  @ApiEndpoint('Update a city', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async update(@Param('id') id: number, @Body() dto: CreateCityDto) {
    return this.citiesService.update(id, dto);
  }

  @Post('/order')
  @ApiEndpoint('Reorder cities', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async updateOrder(@Body() dto: BulkUpdateOrderDto) {
    return this.citiesService.updateOrdering(dto.items);
  }

  @Delete(':id')
  @ApiEndpoint('Delete a city', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async delete(@Param('id') id: number) {
    return this.citiesService.delete(id);
  }
}
