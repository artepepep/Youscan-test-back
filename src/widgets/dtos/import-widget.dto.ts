import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ImportableWidgetType } from '../types/importable-widget.type';
import { IMPORTABLE_WIDGET_TYPES } from '../constants/importable-widget-types.const';

export class ImportWidgetDto {
  @IsIn(IMPORTABLE_WIDGET_TYPES)
  type!: ImportableWidgetType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sheet?: string;
}
