import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto, GetMyReviewsDto } from './dto/query-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { I18nLang } from 'nestjs-i18n';
import { LanguageEnum } from '../../types';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    return this.reviewsService.create(createReviewDto, req.user.sub);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getMyReviews(
    @Req() req: any,
    @Query() query: GetMyReviewsDto,
    @I18nLang() lang: LanguageEnum,
  ) {
    const userId = req.user.sub;
    return this.reviewsService.getUserReviews(userId, query, lang);
  }

  @Get('/:entityId/:entityType')
  getReviewsByEntity(
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('entityType') entityType: 'place' | 'event',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.getReviewsByEntity(
      entityId,
      entityType,
      page,
      limit,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req: any,
  ) {
    return this.reviewsService.update(id, updateReviewDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reviewsService.remove(id, req.user.sub);
  }
}
