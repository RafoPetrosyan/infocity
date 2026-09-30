import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from './swagger/api-docs';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiEndpoint('Health check')
  getHello(): string {
    return this.appService.getHello();
  }
}
