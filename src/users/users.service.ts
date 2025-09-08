import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from './models/user.model';
import { Verification } from './models/verification.model';
import { MailService } from '../mail/mail.service';
import { LanguageEnum } from '../../types';
import { VerifyDto } from './dto/verify.dto';
import { ResendDto } from './dto/resend.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EmotionsModel } from '../emotions/models/emotions.model';
import { unlink } from 'fs/promises';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User)
    private userModel: typeof User,

    @InjectModel(Verification)
    private verificationModel: typeof Verification,

    @InjectModel(EmotionsModel)
    private emotionsModel: typeof EmotionsModel,

    private readonly mailService: MailService,
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
    const user = await this.userModel.findByPk(id, {
      attributes: [
        'id',
        'email',
        'first_name',
        'last_name',
        'avatar',
        'phone_number',
        'locale',
        'city_id',
        'email_verified',
        'role',
      ],
      include: [
        {
          model: this.emotionsModel,
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) return null;

    // Convert Sequelize model → plain object
    const plainUser = user.get({ plain: true });

    const emotion_ids = plainUser.emotions.map((e) => e.id);

    // remove `emotions` field
    delete plainUser.emotions;

    return {
      ...plainUser,
      emotion_ids,
    };
  }

  async getUserEntityById(id: number) {
    return await this.userModel.findByPk(id, {
      attributes: [
        'id',
        'email',
        'first_name',
        'last_name',
        'avatar',
        'phone_number',
        'locale',
        'city_id',
        'email_verified',
        'role',
      ],
    });
  }

  async signIn(email: string, password: string, lang: LanguageEnum) {
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException({
        message: 'validation.invalid_email_or_password',
      });
    }

    const userPassword = user?.getDataValue('password');
    const isComparePassword = await User.comparePasswords(
      password,
      userPassword,
    );

    if (!isComparePassword) {
      throw new BadRequestException({
        message: 'validation.invalid_email_or_password',
      });
    }

    if (!user.email_verified) {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      await this.verificationModel.create({
        user_id: user.id,
        code: verificationCode,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      });

      const verification_token = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '12h' },
      );

      try {
        await this.mailService.sendVerificationEmail(
          user.email,
          verificationCode,
          lang,
        );
      } catch (err) {
        throw new BadRequestException({
          message: 'validation.email_is_not_exist',
        });
      }

      return {
        message: 'Verification code sent to your email',
        verification_token,
      };
    }

    const userData = user.toJSON();
    const payload = { sub: userData.id, role: userData.role };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '3d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '15d',
    });

    await user.update({ refresh_token });

    const userResponse = await this.getUserById(payload.sub);

    return {
      user: userResponse,
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
        expiresIn: '3d',
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: '15d',
      });

      await user.update({ refresh_token: newRefreshToken });

      const userResponse = await this.getUserById(user.id);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: userResponse,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signUp(body: SignUpDto, lang: LanguageEnum) {
    const existingUser = await this.userModel.findOne({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestException({
        message: 'validation.email_already_in_use',
      });
    }

    const newUser = await this.userModel.create({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      password: body.password,
      fcm_token: body.fcm_token || null,
    });

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    await this.verificationModel.create({
      user_id: newUser.id,
      code: verificationCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    const verification_token = this.jwtService.sign(
      { sub: newUser.id },
      { expiresIn: '12h' },
    );

    try {
      await this.mailService.sendVerificationEmail(
        newUser.email,
        verificationCode,
        lang,
      );
    } catch (err) {
      console.log(err, 'err');
      throw new BadRequestException({
        message: 'validation.email_is_not_exist',
      });
    }

    return {
      message: 'Verification code sent to your email',
      verification_token,
    };
  }

  async verifyEmail(body: VerifyDto) {
    const { code, token } = body;

    const payload = this.jwtService.verify(token);
    const user = await this.userModel.findByPk(payload.sub, {
      attributes: [
        'id',
        'email',
        'first_name',
        'last_name',
        'avatar',
        'phone_number',
        'locale',
        'city_id',
        'email_verified',
        'role',
      ],
    });

    if (!user) throw new BadRequestException({ message: 'User not found' });

    const verification = await this.verificationModel.findOne({
      where: {
        user_id: user.id,
        code,
        type: 'email',
        is_forgot_password: false,
      },
    });

    if (!verification || verification.expires_at < new Date()) {
      throw new BadRequestException({
        message: 'validation.invalid_or_expired_code',
      });
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '3d' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '15d' },
    );

    await user.update({ email_verified: true, refresh_token: refreshToken });

    await this.verificationModel.destroy({
      where: {
        user_id: user.id,
        type: 'email',
        is_forgot_password: false,
      },
    });

    const response = await this.getUserById(user.id);

    return {
      message: 'Email verified successfully',
      user: response,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async resendEmailCode(body: ResendDto, lang: LanguageEnum) {
    const { token } = body;

    const payload = this.jwtService.verify(token);
    const user = await this.userModel.findByPk(payload.sub);

    if (!user) throw new BadRequestException({ message: 'User not found' });

    if (user.email_verified) {
      throw new BadRequestException({ message: 'Email already verified' });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    await this.verificationModel.create({
      user_id: user.id,
      code: verificationCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationCode,
        lang,
      );
    } catch (err) {
      throw new BadRequestException({
        message: 'validation.email_is_not_exist',
      });
    }

    return {
      message: 'Verification code sent to your email',
    };
  }

  async forgotPassword(body: ForgotPasswordDto, lang: LanguageEnum) {
    const existingUser = await this.userModel.findOne({
      where: { email: body.email },
    });

    if (!existingUser) {
      throw new BadRequestException({
        message: 'validation.email_is_not_exist',
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    await this.verificationModel.create({
      user_id: existingUser.id,
      code: verificationCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      is_forgot_password: true,
    });

    const verification_token = this.jwtService.sign(
      { sub: existingUser.id },
      { expiresIn: '12h' },
    );

    try {
      await this.mailService.sendVerificationEmail(
        existingUser.email,
        verificationCode,
        lang,
      );
    } catch (err) {
      throw new BadRequestException({
        message: 'validation.email_is_not_exist',
      });
    }

    return {
      message: 'Verification code sent to your email',
      verification_token,
    };
  }

  async checkForgotPasswordCode(body: VerifyDto) {
    const { code, token } = body;

    const payload = this.jwtService.verify(token);
    const user = await this.getUserById(payload.sub);

    if (!user) throw new BadRequestException({ message: 'User not found' });

    const verification = await this.verificationModel.findOne({
      where: { user_id: user.id, code, is_forgot_password: true },
    });

    if (!verification || verification.expires_at < new Date()) {
      throw new BadRequestException({
        message: 'validation.invalid_or_expired_code',
      });
    }

    await this.verificationModel.destroy({
      where: { user_id: user.id, type: 'email', is_forgot_password: true },
    });

    return {
      message: 'Success',
    };
  }

  async resetPassword(body: ResetPasswordDto) {
    const { token, password } = body;

    const payload = this.jwtService.verify(token);
    const user = await this.getUserEntityById(payload.sub);

    if (!user) throw new BadRequestException({ message: 'User not found' });

    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '3d' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '15d' },
    );

    await user.update({
      email_verified: true,
      refresh_token: refreshToken,
      password,
    });

    const response = await this.getUserById(user.id);

    return {
      message: 'Password reset successfully',
      user: response,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async changePassword(userId: number, body: ChangePasswordDto) {
    const { old_password, password } = body;

    const user = await this.userModel.findByPk(userId);
    if (!user) throw new BadRequestException({ message: 'User not found' });

    const userPassword = user?.getDataValue('password');
    const isComparePassword = await User.comparePasswords(
      old_password,
      userPassword,
    );

    if (!isComparePassword) {
      throw new BadRequestException({
        message: 'validation.old_password_is_incorrect',
      });
    }

    await user.update({
      password,
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async updateProfile(userId: number, body: UpdateProfileDto) {
    const user = await this.getUserEntityById(userId);

    if (!user) throw new BadRequestException({ message: 'User not found' });

    const updateInfo: any = {
      first_name: body.first_name ?? user.first_name,
      last_name: body.last_name ?? user.last_name,
      phone_number: body.phone_number ?? user.phone_number,
      fcm_token: body.fcm_token ?? user.fcm_token,
      locale: body.locale ?? user.locale,
      latitude: body.latitude ?? user.latitude,
      longitude: body.longitude ?? user.longitude,
      city_id: body.city_id ?? user.city_id,
    };

    if (body.latitude && body.longitude) {
      updateInfo.location = {
        type: 'Point',
        coordinates: [body.longitude, body.latitude],
      };
    }
    await user.update(updateInfo);

    if (body.emotion_ids && body.emotion_ids.length > 0) {
      const uniqueEmotionIds = Array.from(new Set(body.emotion_ids));
      await user.$set('emotions', uniqueEmotionIds);
    }

    const response = await this.getUserById(userId);
    return {
      message: 'Profile updated successfully',
      user: response,
    };
  }

  async updateAvatar(userId: number, image?: string, pathname?: string) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }

    const user = await this.getUserEntityById(userId);
    if (!user) {
      if (pathname) await unlink(pathname);
      throw new BadRequestException({ message: 'User not found' });
    }

    if (user.dataValues.avatar && !user.dataValues.avatar.startsWith('http')) {
      await unlink(`uploads/avatars/${user.dataValues.avatar}`);
    }

    await user.update({ avatar: image });
    const response = await this.getUserById(userId);
    return {
      message: 'Avatar updated successfully',
      user: response,
    };
  }
}
