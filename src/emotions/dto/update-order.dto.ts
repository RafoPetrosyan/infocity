import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';

class UpdateOrderItemDto {
  @IsInt()
  id: number;

  @IsInt()
  order: number;
}

export class BulkUpdateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsNotEmpty()
  items: UpdateOrderItemDto[];
}
