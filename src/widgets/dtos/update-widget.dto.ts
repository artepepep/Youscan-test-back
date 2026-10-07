import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  content?: string;
}
