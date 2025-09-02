import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateVersionsDto } from './dto/update-versions.dto';
import { MobileVersion } from './mobile.model';

@Injectable()
export class MobileService {
  constructor(
    @InjectModel(MobileVersion)
    private mobileModel: typeof MobileVersion,
  ) {}

  async getAll() {
    return await this.mobileModel.findOne({
      attributes: [
        'ios_version',
        'android_version',
        'force_update',
        'app_working',
      ],
    });
  }

  async update(id: number, dto: UpdateVersionsDto) {
    const version = await this.mobileModel.findByPk(id);

    if (!version) {
      throw new BadRequestException();
    }

    await version.update({
      ...dto,
    });

    return { message: 'Version updated successfully.' };
  }
}
