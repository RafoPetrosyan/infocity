import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { UserContact } from './models/user-contact.model';
import { User } from '../users/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([UserContact, User]),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}

