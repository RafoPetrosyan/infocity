import { Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileController } from './mobile.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { MobileVersion } from './mobile.model';

@Module({
  imports: [SequelizeModule.forFeature([MobileVersion])],
  providers: [MobileService],
  controllers: [MobileController],
})
export class MobileModule {}
