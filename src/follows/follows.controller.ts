import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowDto, GetFollowsDto } from './dto/follow.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { I18nLang } from 'nestjs-i18n';
import { LanguageEnum } from '../../types';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../swagger/api-docs';

@ApiTags('Follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @ApiEndpoint('Follow or unfollow a place or event', {
    auth: 'required',
    roles: ['user'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async follow(@Req() req: any, @Body() followDto: FollowDto) {
    const userId = req.user.sub;
    return this.followsService.follow(userId, followDto);
  }

  @Get()
  @ApiEndpoint('List places and events followed by the current user', {
    auth: 'required',
    roles: ['user'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getMyFollows(
    @Req() req: any,
    @Query() query: GetFollowsDto,
    @I18nLang() lang: LanguageEnum,
  ) {
    const userId = req.user.sub;
    return this.followsService.getUserFollows(userId, query, lang);
  }
}




