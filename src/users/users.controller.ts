import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    return await this.usersService.signIn(body.email, body.password);
  }

  @Post('refresh-token')
  async refresh(@Body() body: RefreshTokenDto) {
    return await this.usersService.refreshToken(body.refresh_token);
  }
}
