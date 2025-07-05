import { Controller, Post, Body, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { I18nLang } from 'nestjs-i18n';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAll(@I18nLang() lang: string) {
    return this.categoriesService.getAll(lang);
  }

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @I18nLang() lang: string,
  ) {
    return this.categoriesService.create(createCategoryDto);
  }
}
