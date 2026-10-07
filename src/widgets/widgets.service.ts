import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWidgetDto } from './dtos/create-widget.dto';
import { ImportWidgetDto } from './dtos/import-widget.dto';
import { UpdateWidgetDto } from './dtos/update-widget.dto';
import { Widget } from './entities/widget.entity';
import { WidgetImportService } from './services/widget-import.service';
import { WidgetsRepository } from './widgets.repository';
import { createRandomWidgetData } from '../shared/helpers/create-random-widget-data';

const DEFAULT_TITLES = {
  line: 'Line chart',
  bar: 'Bar chart',
  'stacked-bar': 'Stacked bar chart',
  pie: 'Pie chart',
  text: 'Text widget',
} as const;

@Injectable()
export class WidgetsService {
  constructor(
    private readonly widgetsRepository: WidgetsRepository,
    private readonly widgetImportService: WidgetImportService,
  ) {}

  findAll(): Promise<Widget[]> {
    return this.widgetsRepository.findAll();
  }

  async findOne(id: string): Promise<Widget> {
    const widget = await this.widgetsRepository.findById(id);
    if (!widget) {
      throw new NotFoundException(`Widget ${id} was not found`);
    }
    return widget;
  }

  async create(dto: CreateWidgetDto): Promise<Widget> {
    if (dto.type !== 'text' && dto.content !== undefined) {
      throw new BadRequestException('Content is only valid for text widgets');
    }

    const data =
      dto.type === 'text'
        ? { content: dto.content ?? '' }
        : createRandomWidgetData(dto.type);

    return this.widgetsRepository.create({
      type: dto.type,
      title: dto.title?.trim() || DEFAULT_TITLES[dto.type],
      data,
      position: await this.widgetsRepository.getNextPosition(),
    });
  }

  async import(
    file: Express.Multer.File | undefined,
    dto: ImportWidgetDto,
  ): Promise<Widget> {
    if (!file) {
      throw new BadRequestException('A data file is required');
    }

    const data = this.widgetImportService.parse(
      file.buffer,
      file.originalname,
      dto.type,
      dto.sheet,
    );

    return this.widgetsRepository.create({
      type: dto.type,
      title: dto.title?.trim() || DEFAULT_TITLES[dto.type],
      data,
      position: await this.widgetsRepository.getNextPosition(),
    });
  }

  async update(id: string, dto: UpdateWidgetDto): Promise<Widget> {
    if (dto.title === undefined && dto.content === undefined) {
      throw new BadRequestException('At least one field must be provided');
    }
    if (dto.title !== undefined && dto.title.trim() === '') {
      throw new BadRequestException('Title cannot be empty');
    }

    const widget = await this.findOne(id);

    if (dto.content !== undefined && widget.type !== 'text') {
      throw new BadRequestException('Only text widgets have editable content');
    }

    const updated = await this.widgetsRepository.update(id, {
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.content !== undefined && { data: { content: dto.content } }),
    });

    if (!updated) {
      throw new NotFoundException(`Widget ${id} was not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!(await this.widgetsRepository.delete(id))) {
      throw new NotFoundException(`Widget ${id} was not found`);
    }
  }
}
