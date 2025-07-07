import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import * as process from 'node:process';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { ProvincesModule } from './provinces/provinces.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale'] },
        AcceptLanguageResolver,
      ],
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadModels: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),
    UsersModule,
    CategoriesModule,
    ProvincesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
