import { Controller, Get, Query } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { ProvincesService } from './provinces.service';
import { PaginationDto } from './dto/pagination.dto';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provinceService: ProvincesService) {}

  @Get()
  getAll(@I18nLang() lang: string) {
    return this.provinceService.getAll(lang);
  }

  @Get('/cities')
  getAllCities(@I18nLang() lang: string, @Query() pagination: PaginationDto) {
    return this.provinceService.getAllCities(lang, pagination);
  }
}
