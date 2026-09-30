import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAttractionDto } from '../places/dto/create-attraction.dto';
import { CreateItemDto, UpdateItemDto } from '../places/dto/create-item.dto';
import { CreatePlaceDto } from '../places/dto/create-place.dto';
import { UpdatePlaceDto } from '../places/dto/update-place.dto';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';
import { UpdateReviewDto } from '../reviews/dto/update-review.dto';

const imageDescription =
  'Nested objects (en, hy, ru, social_links) may be sent as JSON strings.';

export class CreatePlaceMultipartDto extends CreatePlaceDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Cover image' })
  image: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Logo image',
  })
  logo?: string;
}

export class UpdatePlaceMultipartDto extends UpdatePlaceDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Cover image',
  })
  image?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Logo image',
  })
  logo?: string;
}

export class CreateAttractionMultipartDto extends CreateAttractionDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Cover image',
  })
  image?: string;
}

export class CreateEventMultipartDto extends CreateEventDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Cover image' })
  image: string;
}

export class UpdateEventMultipartDto extends UpdateEventDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Cover image',
  })
  image?: string;
}

export class CreateItemMultipartDto extends CreateItemDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Item image',
  })
  image?: string;
}

export class UpdateItemMultipartDto extends UpdateItemDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Item image',
  })
  image?: string;
}

export class CreateReviewMultipartDto extends CreateReviewDto {
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Up to 3 review images',
  })
  images?: string[];
}

export class UpdateReviewMultipartDto extends UpdateReviewDto {
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Up to 3 review images',
  })
  images?: string[];
}

export const multipartObjectDescription = imageDescription;
