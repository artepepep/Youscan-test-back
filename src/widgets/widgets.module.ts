import { Module } from '@nestjs/common';
import { WidgetImportService } from './services/widget-import.service';
import { WidgetsController } from './widgets.controller';
import { WidgetsRepository } from './widgets.repository';
import { WidgetsService } from './widgets.service';

@Module({
  controllers: [WidgetsController],
  providers: [WidgetsService, WidgetsRepository, WidgetImportService],
})
export class WidgetsModule {}
