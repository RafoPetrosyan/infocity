import { Controller, Body, Get, UseGuards, Put, Param } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { UpdateVersionsDto } from './dto/update-versions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../swagger/api-docs';

@ApiTags('Mobile')
@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get('/')
  @ApiEndpoint('Get mobile app version settings')
  getAll() {
    return this.mobileService.getAll();
  }

  @Put(':id')
  @ApiEndpoint('Update mobile app version settings', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  async update(@Param('id') id: number, @Body() dto: UpdateVersionsDto) {
    return this.mobileService.update(id, dto);
  }
}
