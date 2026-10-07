import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { WIDGET_TYPES } from '../entities/widget.entity';
import type { WidgetType } from '../entities/widget.entity';

export class CreateWidgetDto {
  @IsIn(WIDGET_TYPES)
  type!: WidgetType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  content?: string;
}
