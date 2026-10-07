import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreateWidgetDto } from './dtos/create-widget.dto';
import { ImportWidgetDto } from './dtos/import-widget.dto';
import { UpdateWidgetDto } from './dtos/update-widget.dto';
import { Widget } from './entities/widget.entity';
import { WidgetsService } from './widgets.service';
import { WidgetFileInterceptor } from './interceptors/widget-file.interceptor';

@Controller('widgets')
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Get()
  findAll(): Promise<Widget[]> {
    return this.widgetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Widget> {
    return this.widgetsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWidgetDto): Promise<Widget> {
    return this.widgetsService.create(dto);
  }

  @Post('import')
  @UseInterceptors(WidgetFileInterceptor)
  import(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: ImportWidgetDto,
  ): Promise<Widget> {
    return this.widgetsService.import(file, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWidgetDto,
  ): Promise<Widget> {
    return this.widgetsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.widgetsService.remove(id);
  }
}
