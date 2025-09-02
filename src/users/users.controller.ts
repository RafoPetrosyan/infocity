import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { I18nLang } from 'nestjs-i18n';
import { LanguageEnum } from '../../types';
import { VerifyDto } from './dto/verify.dto';
import { ResendDto } from './dto/resend.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  getAll(@Query() params: GetUsersDto) {
    return this.usersService.getAll(params);
  }

  @Get('/current-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin', 'user')
  getCurrentUser(@Req() req: any) {
    const userId = req.user.sub;
    return this.usersService.getUserById(userId);
  }

  @Post('sign-in')
  async signIn(@Body() body: SignInDto, @I18nLang() lang: LanguageEnum) {
    return await this.usersService.signIn(body.email, body.password, lang);
  }

  @Post('refresh-token')
  async refresh(@Body() body: RefreshTokenDto) {
    return await this.usersService.refreshToken(body.refresh_token);
  }

  @Post('sign-up')
  async signUp(@Body() body: SignUpDto, @I18nLang() lang: LanguageEnum) {
    return await this.usersService.signUp(body, lang);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyDto) {
    return await this.usersService.verifyEmail(body);
  }

  @Post('resend-email-code')
  async resendEmailCode(
    @Body() body: ResendDto,
    @I18nLang() lang: LanguageEnum,
  ) {
    return await this.usersService.resendEmailCode(body, lang);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @I18nLang() lang: LanguageEnum,
  ) {
    return await this.usersService.forgotPassword(body, lang);
  }

  @Post('verify-forgot-password-code')
  async verifyForgotPasswordCode(@Body() body: VerifyDto) {
    return await this.usersService.checkForgotPasswordCode(body);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.usersService.resetPassword(body);
  }

  @Post('/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin', 'user')
  changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    const userId = req.user.sub;
    return this.usersService.changePassword(userId, body);
  }
}
