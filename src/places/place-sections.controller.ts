import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PlaceSectionsService } from './place-sections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreatePlaceSectionDto, UpdatePlaceSectionDto } from './dto/create-place-section.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../swagger/api-docs';

@ApiTags('Place sections')
@Controller('places/:placeId/place-sections')
export class PlaceSectionsController {
  constructor(private readonly placeSectionsService: PlaceSectionsService) {}

  @Get('/')
  @ApiEndpoint('List sections in a place')
  @ApiParam({ name: 'placeId', type: Number })
  list(@Param('placeId') placeId: number) {
    return this.placeSectionsService.list(Number(placeId));
  }

  @Post('/')
  @ApiEndpoint('Create a place section', { auth: 'required', roles: ['user'] })
  @ApiParam({ name: 'placeId', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  create(
    @Req() req: any,
    @Param('placeId') placeId: number,
    @Body() dto: CreatePlaceSectionDto,
  ) {
    return this.placeSectionsService.create(req.user.sub, Number(placeId), dto);
  }

  @Put('/:menuId')
  @ApiEndpoint('Update a place section', { auth: 'required', roles: ['user'] })
  @ApiParam({ name: 'placeId', type: Number })
  @ApiParam({ name: 'menuId', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  update(
    @Req() req: any,
    @Param('placeId') placeId: number,
    @Param('menuId') menuId: number,
    @Body() dto: UpdatePlaceSectionDto,
  ) {
    return this.placeSectionsService.update(
      req.user.sub,
      Number(placeId),
      Number(menuId),
      dto,
    );
  }

  @Delete('/:menuId')
  @ApiEndpoint('Delete a place section', { auth: 'required', roles: ['user'] })
  @ApiParam({ name: 'placeId', type: Number })
  @ApiParam({ name: 'menuId', type: Number })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  remove(
    @Req() req: any,
    @Param('placeId') placeId: number,
    @Param('menuId') menuId: number,
  ) {
    return this.placeSectionsService.delete(
      req.user.sub,
      Number(placeId),
      Number(menuId),
    );
  }
}
