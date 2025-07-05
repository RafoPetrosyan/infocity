import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private categoryModel: typeof User,
  ) {}

  async getAll() {
    return await this.categoryModel.findAll();
  }
}
