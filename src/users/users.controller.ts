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
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { GetUsersDto } from './dto/get-users.dto';
import { SignUpDto } from './dto/sign-up.dto';
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
  async signIn(@Body() body: SignInDto) {
    return await this.usersService.signIn(body.email, body.password);
  }

  @Post('refresh-token')
  async refresh(@Body() body: RefreshTokenDto) {
    return await this.usersService.refreshToken(body.refresh_token);
  }

  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    return await this.usersService.signUp(body);
  }
}
