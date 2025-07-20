import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async getAll(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const whereCondition = query.search
      ? {
          [Op.or]: [
            { email: { [Op.iLike]: `%${query.search}%` } },
            { phone_number: { [Op.iLike]: `%${query.search}%` } },
            { first_name: { [Op.iLike]: `%${query.search}%` } },
            { last_name: { [Op.iLike]: `%${query.search}%` } },
            Sequelize.where(
              Sequelize.fn(
                'concat',
                Sequelize.col('first_name'),
                ' ',
                Sequelize.col('last_name'),
              ),
              {
                [Op.iLike]: `%${query.search}%`,
              },
            ),
          ],
        }
      : {};

    const { rows: users, count: total } = await this.userModel.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number) {
    return await this.userModel.findByPk(id);
  }

  async signIn(email: string, password: string) {
    const user = await this.userModel.findOne({
      where: { email },
      attributes: [
        'id',
        'email',
        'password',
        'first_name',
        'last_name',
        'role',
        'avatar',
        'verified',
        'phone_number',
      ],
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const userPassword = user?.getDataValue('password');
    const isComparePassword = await User.comparePasswords(
      password,
      userPassword,
    );

    if (!isComparePassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userData = user.toJSON();
    const payload = { sub: userData.id, role: userData.role };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      user: userData,
      access_token,
      refresh_token,
    };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const decoded = this.jwtService.verify(oldRefreshToken);

      const user = await this.userModel.findByPk(decoded.sub);
      if (!user) throw new UnauthorizedException();

      const userData = user.toJSON();
      const payload = { sub: userData.id, role: userData.role };

      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: '30d',
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
