import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { WidgetImportService } from '../../widgets/services/widget-import.service';
import { WidgetsRepository } from '../../widgets/widgets.repository';
import * as schema from '../schema';

const logger = new Logger('WidgetsSeed');

async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString });
  const widgetsRepository = new WidgetsRepository(drizzle(pool, { schema }));
  const widgetImportService = new WidgetImportService();

  try {
    if ((await widgetsRepository.findAll()).length > 0) {
      logger.log('Widgets already exist; seed skipped');
      return;
    }

    const dataDirectory =
      process.env.DATA_DIRECTORY ?? join(process.cwd(), 'data');
    let filenames: string[];

    try {
      filenames = await readdir(dataDirectory);
    } catch {
      throw new Error(`Widget data directory was not found: ${dataDirectory}`);
    }

    const workbookName = filenames.find((name) =>
      ['.xlsx', '.xls'].includes(extname(name).toLowerCase()),
    );
    const csvName = filenames.find(
      (name) => extname(name).toLowerCase() === '.csv',
    );

    if (!workbookName || !csvName) {
      throw new Error(
        `Add one XLSX and one CSV file to ${dataDirectory} before seeding`,
      );
    }

    const [workbook, csv] = await Promise.all([
      readFile(join(dataDirectory, workbookName)),
      readFile(join(dataDirectory, csvName)),
    ]);

    const initialWidgets = [
      {
        type: 'line' as const,
        title: 'Line chart',
        data: widgetImportService.parse(workbook, workbookName, 'line'),
      },
      {
        type: 'pie' as const,
        title: 'Pie chart',
        data: widgetImportService.parse(workbook, workbookName, 'pie'),
      },
      {
        type: 'stacked-bar' as const,
        title: 'Stacked bar chart',
        data: widgetImportService.parse(csv, csvName, 'stacked-bar'),
      },
    ];

    for (const [position, widget] of initialWidgets.entries()) {
      await widgetsRepository.create({ ...widget, position });
    }

    logger.log('Seeded the initial dashboard widgets from supplied files');
  } finally {
    await pool.end();
  }
}

void seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message);
  process.exitCode = 1;
});
