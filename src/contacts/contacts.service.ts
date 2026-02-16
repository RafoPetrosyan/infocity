import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { UserContact } from './models/user-contact.model';
import { User } from '../users/models/user.model';
import { SendContactRequestDto } from './dto/send-contact-request.dto';
import { AcceptContactRequestDto } from './dto/accept-contact-request.dto';
import { QueryContactsDto } from './dto/query-contacts.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(UserContact)
    private userContactModel: typeof UserContact,

    @InjectModel(User)
    private userModel: typeof User,

    private notificationsService: NotificationsService,
  ) {}

  async sendContactRequest(
    senderId: number,
    dto: SendContactRequestDto,
  ): Promise<{ message: string }> {
    const { receiver_id } = dto;

    // Check if trying to add themselves
    if (senderId === receiver_id) {
      throw new BadRequestException('Cannot send contact request to yourself');
    }

    // Check if receiver exists
    const receiver = await this.userModel.findByPk(receiver_id);
    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    // Check if already contacts (accepted)
    const existingContact = await this.userContactModel.findOne({
      where: {
        user_id: senderId,
        contact_id: receiver_id,
        status: 'accepted',
      },
    });

    if (existingContact) {
      throw new ConflictException('Already in contacts');
    }

    // Check if there's already a pending request sent by me
    const existingRequest = await this.userContactModel.findOne({
      where: {
        user_id: senderId,
        contact_id: receiver_id,
        status: 'pending',
      },
    });

    if (existingRequest) {
      throw new ConflictException('Contact request already sent');
    }

    // Check if there's a reverse pending request (receiver already sent request to sender)
    const reverseRequest = await this.userContactModel.findOne({
      where: {
        user_id: receiver_id,
        contact_id: senderId,
        status: 'pending',
      },
    });

    if (reverseRequest) {
      // Auto-accept the reverse request and add both to contacts
      reverseRequest.status = 'accepted';
      await reverseRequest.save();

      // Create the reverse contact relationship
      await this.userContactModel.create({
        user_id: senderId,
        contact_id: receiver_id,
        status: 'accepted',
      });

      return { message: 'Contact request accepted automatically' };
    }

    // Create new contact request (pending)
    const request = await this.userContactModel.create({
      user_id: senderId,
      contact_id: receiver_id,
      status: 'pending',
    });

    await this.notificationsService.create({
      user_id: receiver_id,
      type: 'contact_request',
      reference_type: 'contact_request',
      reference_id: request.id,
      title: 'Contact request',
      body: 'Someone wants to add you as a contact',
    });

    return { message: 'Contact request sent successfully' };
  }

  async acceptContactRequest(
    userId: number,
    dto: AcceptContactRequestDto,
  ): Promise<{ message: string }> {
    const { request_id } = dto;

    // Find the contact request
    const request = await this.userContactModel.findByPk(request_id);

    if (!request) {
      throw new NotFoundException('Contact request not found');
    }

    // Check if user is the receiver (contact_id)
    if (request.contact_id !== userId) {
      throw new BadRequestException('Unauthorized to accept this request');
    }

    // Check if already accepted
    if (request.status === 'accepted') {
      throw new ConflictException('Request already accepted');
    }

    // Update request status to accepted
    request.status = 'accepted';
    await request.save();

    // Create the reverse contact relationship
    await this.userContactModel.create({
      user_id: userId,
      contact_id: request.user_id,
      status: 'accepted',
    });

    return { message: 'Contact request accepted successfully' };
  }

  async rejectContactRequest(
    userId: number,
    dto: AcceptContactRequestDto,
  ): Promise<{ message: string }> {
    const { request_id } = dto;

    // Find the contact request
    const request = await this.userContactModel.findByPk(request_id);

    if (!request) {
      throw new NotFoundException('Contact request not found');
    }

    // Check if user is the receiver (contact_id)
    if (request.contact_id !== userId) {
      throw new BadRequestException('Unauthorized to reject this request');
    }

    // Check if already accepted
    if (request.status === 'accepted') {
      throw new ConflictException('Cannot reject an accepted request');
    }

    // Delete the request
    await request.destroy();

    return { message: 'Contact request rejected successfully' };
  }

  async removeContact(
    userId: number,
    id: number,
  ): Promise<{ message: string }> {
    // Find the contact relationship
    const contact = await this.userContactModel.findByPk(id);

    if (!contact || contact.user_id !== userId) {
      throw new NotFoundException('Contact not found');
    }

    await this.userContactModel.destroy({
      where: {
        user_id: contact.contact_id,
        contact_id: userId,
        status: 'accepted',
      },
    });

    await contact.destroy();
    return { message: 'Contact removed successfully' };
  }

  async getMyContacts(userId: number, query: QueryContactsDto) {
    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;

    // Build the include with optional search filter
    const includeConfig: any = {
      model: User,
      as: 'contact',
      attributes: [
        'id',
        'first_name',
        'last_name',
        'email',
        'avatar',
        'phone_number',
      ],
    };

    if (search) {
      includeConfig.where = {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone_number: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await this.userContactModel.findAndCountAll({
      where: {
        user_id: userId,
        status: 'accepted',
      },
      limit,
      offset,
      include: [includeConfig],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }

  async getPendingRequests(userId: number, query: QueryContactsDto) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.userContactModel.findAndCountAll({
      where: {
        contact_id: userId,
        status: 'pending',
      },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'id',
            'first_name',
            'last_name',
            'email',
            'avatar',
            'phone_number',
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }

  async getSentRequests(userId: number, query: QueryContactsDto) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.userContactModel.findAndCountAll({
      where: {
        user_id: userId,
        status: 'pending',
      },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'contact',
          attributes: [
            'id',
            'first_name',
            'last_name',
            'email',
            'avatar',
            'phone_number',
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        pages_count: Math.ceil(count / limit),
      },
    };
  }
}
