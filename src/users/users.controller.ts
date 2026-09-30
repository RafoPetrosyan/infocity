import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
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
import { UploadAndOptimizeImages } from '../../utils/upload-and-optimize.helper';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SocialSignInDto } from './dto/social-sign-in.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint, ApiFileBody } from '../swagger/api-docs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/list')
  @ApiEndpoint('List users', { auth: 'required', roles: ['user'] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  get(@Query() params: GetUsersDto, @Req() req: any) {
    const userId = req?.user?.sub;
    return this.usersService.getAll(params, userId);
  }

  @Get()
  @ApiEndpoint('List users for admin', {
    auth: 'required',
    roles: ['super-admin', 'admin'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  getAllAdmin(@Query() params: GetUsersDto) {
    return this.usersService.getAllAdmin(params);
  }

  @Get('/current-user')
  @ApiEndpoint('Get the current user', {
    auth: 'required',
    roles: ['super-admin', 'admin', 'user'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin', 'user')
  getCurrentUser(@Req() req: any) {
    const userId = req.user.sub;
    return this.usersService.getUserById(userId);
  }

  @Post('sign-in')
  @ApiEndpoint('Sign in with email and password')
  async signIn(@Body() body: SignInDto, @I18nLang() lang: LanguageEnum) {
    return await this.usersService.signIn(body.email, body.password, lang);
  }

  @Post('google-sign-in')
  @ApiEndpoint('Sign in with Google')
  async googleSignIn(@Body() body: SocialSignInDto) {
    return await this.usersService.googleSignIn(body);
  }

  @Post('facebook-sign-in')
  @ApiEndpoint('Sign in with Facebook')
  async facebookSignIn(@Body() body: SocialSignInDto) {
    return await this.usersService.facebookSignIn(body);
  }

  @Post('refresh-token')
  @ApiEndpoint('Refresh an access token')
  async refresh(@Body() body: RefreshTokenDto) {
    return await this.usersService.refreshToken(body.refresh_token);
  }

  @Post('sign-up')
  @ApiEndpoint('Register a user')
  async signUp(@Body() body: SignUpDto, @I18nLang() lang: LanguageEnum) {
    return await this.usersService.signUp(body, lang);
  }

  @Post('verify-email')
  @ApiEndpoint('Verify an email address')
  async verifyEmail(@Body() body: VerifyDto) {
    return await this.usersService.verifyEmail(body);
  }

  @Post('resend-email-code')
  @ApiEndpoint('Resend an email verification code')
  async resendEmailCode(
    @Body() body: ResendDto,
    @I18nLang() lang: LanguageEnum,
  ) {
    return await this.usersService.resendEmailCode(body, lang);
  }

  @Post('forgot-password')
  @ApiEndpoint('Request a password reset code')
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @I18nLang() lang: LanguageEnum,
  ) {
    return await this.usersService.forgotPassword(body, lang);
  }

  @Post('verify-forgot-password-code')
  @ApiEndpoint('Verify a password reset code')
  async verifyForgotPasswordCode(@Body() body: VerifyDto) {
    return await this.usersService.checkForgotPasswordCode(body);
  }

  @Post('reset-password')
  @ApiEndpoint('Reset a password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.usersService.resetPassword(body);
  }

  @Post('/change-password')
  @ApiEndpoint('Change the current user password', {
    auth: 'required',
    roles: ['user'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    const userId = req.user.sub;
    return this.usersService.changePassword(userId, body);
  }

  @Post('/update-profile')
  @ApiEndpoint('Update the current user profile', {
    auth: 'required',
    roles: ['user'],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, body);
  }

  @Post('/update-profile-image')
  @ApiEndpoint('Update the current user avatar', {
    auth: 'required',
    roles: ['user'],
  })
  @ApiFileBody({ image: { required: true } }, 'Single avatar image.')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @UseInterceptors(
    UploadAndOptimizeImages([{ name: 'image', maxCount: 1 }], {
      folder: 'avatars',
    }),
  )
  updateAvatar(
    @Req() req: any,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;
    const image = files?.image?.[0];

    return this.usersService.updateAvatar(userId, image?.filename, image?.path);
  }
}
