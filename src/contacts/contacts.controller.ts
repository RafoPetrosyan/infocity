import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { SendContactRequestDto } from './dto/send-contact-request.dto';
import { AcceptContactRequestDto } from './dto/accept-contact-request.dto';
import { QueryContactsDto } from './dto/query-contacts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async sendContactRequest(
    @Req() req: any,
    @Body() dto: SendContactRequestDto,
  ) {
    const userId = req.user.sub;
    return this.contactsService.sendContactRequest(userId, dto);
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async acceptContactRequest(
    @Req() req: any,
    @Body() dto: AcceptContactRequestDto,
  ) {
    const userId = req.user.sub;
    return this.contactsService.acceptContactRequest(userId, dto);
  }

  @Post('reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async rejectContactRequest(
    @Req() req: any,
    @Body() dto: AcceptContactRequestDto,
  ) {
    const userId = req.user.sub;
    return this.contactsService.rejectContactRequest(userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async removeContact(@Req() req: any, @Param('id') contactId: string) {
    const userId = req.user.sub;
    return this.contactsService.removeContact(userId, parseInt(contactId));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getMyContacts(@Req() req: any, @Query() query: QueryContactsDto) {
    const userId = req.user.sub;
    return this.contactsService.getMyContacts(userId, query);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getPendingRequests(@Req() req: any, @Query() query: QueryContactsDto) {
    const userId = req.user.sub;
    return this.contactsService.getPendingRequests(userId, query);
  }

  @Get('sent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getSentRequests(@Req() req: any, @Query() query: QueryContactsDto) {
    const userId = req.user.sub;
    return this.contactsService.getSentRequests(userId, query);
  }
}
