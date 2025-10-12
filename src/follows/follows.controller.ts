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

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async follow(@Req() req: any, @Body() followDto: FollowDto) {
    const userId = req.user.sub;
    return this.followsService.follow(userId, followDto);
  }

  @Get()
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


