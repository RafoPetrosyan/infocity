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
import { GetMyReviewsDto } from './dto/query-review.dto';
import { CreateReviewReplyDto } from './dto/create-review-reply.dto';
import { UpdateReviewReplyDto } from './dto/update-review-reply.dto';
import { ToggleLikeDto } from './dto/toggle-like.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
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

  @Get('/:reviewId/replies')
  @UseGuards(OptionalJwtAuthGuard)
  getRepliesByReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    const userId = req?.user?.sub;
    return this.reviewsService.getRepliesByReview(
      reviewId,
      page,
      limit,
      userId,
    );
  }

  @Get('/:entityId/:entityType')
  @UseGuards(OptionalJwtAuthGuard)
  getReviewsByEntity(
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('entityType') entityType: 'place' | 'event',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    const userId = req?.user?.sub;
    return this.reviewsService.getReviewsByEntity(
      entityId,
      entityType,
      page,
      limit,
      userId,
    );
  }

  @Get('/:entityId/:entityType/emotion-counts')
  getEmotionCounts(
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('entityType') entityType: 'place' | 'event',
  ) {
    return this.reviewsService.getEmotionCounts(entityId, entityType);
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

  // Review Reply Endpoints

  @Post('replies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  createReply(@Body() createReplyDto: CreateReviewReplyDto, @Req() req: any) {
    return this.reviewsService.createReply(createReplyDto, req.user.sub);
  }

  @Put('replies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  updateReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReplyDto: UpdateReviewReplyDto,
    @Req() req: any,
  ) {
    return this.reviewsService.updateReply(id, updateReplyDto, req.user.sub);
  }

  @Delete('replies/:id')
  @UseGuards(JwtAuthGuard)
  removeReply(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reviewsService.removeReply(id, req.user.sub);
  }

  // Like Endpoints

  @Post('like')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  toggleLike(@Body() toggleLikeDto: ToggleLikeDto, @Req() req: any) {
    return this.reviewsService.toggleLike(toggleLikeDto, req.user.sub);
  }
}
