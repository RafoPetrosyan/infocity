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

@Controller('places/:placeId/place-sections')
export class PlaceSectionsController {
  constructor(private readonly placeSectionsService: PlaceSectionsService) {}

  @Get('/')
  list(@Param('placeId') placeId: number) {
    return this.placeSectionsService.list(Number(placeId));
  }

  @Post('/')
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
