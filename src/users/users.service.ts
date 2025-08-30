import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.model';
import { SignUpDto } from './dto/sign-up.dto';

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
        'email_verified',
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
      expiresIn: '1d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await user.update({ refresh_token });

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
        expiresIn: '1d',
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: '15d',
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

  async signUp(body: SignUpDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await User.hashPassword(body.password);

    const newUser = await this.userModel.create({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: hashedPassword,
    });

    const payload = { sub: newUser.id, role: newUser.role };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: '15d',
    });

    return {
      message: 'User registered successfully',
      user: newUser,
      newAccessToken,
      newRefreshToken,
    };
  }
}
