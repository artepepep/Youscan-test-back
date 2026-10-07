import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { ChartDataRow, ChartWidgetData } from '../entities/widget.entity';
import { toLabel } from '../../shared/helpers/to-label';
import { toNumber } from '../../shared/helpers/to-number';
import { RawRow } from '../../shared/types/raw-row.type';
import { ImportableWidgetType } from '../types/importable-widget.type';
import { excelDateToIso } from '../../shared/helpers/excel-date-to-iso';

@Injectable()
export class WidgetImportService {
  constructor() {}

  parse(
    buffer: Buffer,
    filename: string,
    type: ImportableWidgetType,
    sheetName?: string,
  ): ChartWidgetData {
    const extension = filename.toLowerCase().split('.').pop();
    let rows: RawRow[];

    try {
      if (extension === 'csv') {
        rows = parse<RawRow>(buffer, {
          columns: true,
          delimiter: [',', ';', '\t'],
          skip_empty_lines: true,
          trim: true,
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const selectedSheetName = this.selectSheet(
          workbook.SheetNames,
          type,
          sheetName,
        );

        if (!selectedSheetName) {
          throw new Error('The workbook contains no sheets');
        }

        rows = XLSX.utils.sheet_to_json<RawRow>(
          workbook.Sheets[selectedSheetName],
          { defval: '' },
        );
      } else {
        throw new BadRequestException(
          'Only CSV, XLSX or XLS files are supported',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('The uploaded file could not be parsed');
    }

    return { rows: this.normalizeRows(rows, type) };
  }

  private selectSheet(
    sheetNames: string[],
    type: ImportableWidgetType,
    requestedSheet?: string,
  ): string | undefined {
    if (requestedSheet) {
      const exactMatch = sheetNames.find(
        (name) => name.toLowerCase() === requestedSheet.toLowerCase(),
      );
      if (!exactMatch) {
        throw new BadRequestException(
          `Worksheet "${requestedSheet}" was not found`,
        );
      }
      return exactMatch;
    }

    const typeMatch = sheetNames.find((name) =>
      name.toLowerCase().includes(type.replace('-', ' ')),
    );
    if (typeMatch) {
      return typeMatch;
    }

    return type === 'pie' && sheetNames.length > 1
      ? sheetNames[1]
      : sheetNames[0];
  }

  private normalizeRows(
    rawRows: RawRow[],
    type: ImportableWidgetType,
  ): ChartDataRow[] {
    if (rawRows.length === 0) {
      throw new BadRequestException('The uploaded file contains no data rows');
    }

    const columns = Array.from(
      new Set(rawRows.flatMap((row) => Object.keys(row))),
    );

    if (type === 'line') {
      const longFormRows = this.normalizeLongFormLineRows(rawRows, columns);
      if (longFormRows) {
        return longFormRows;
      }
    }

    const numericColumns = columns.filter((column) =>
      rawRows.some((row) => toNumber(row[column]) !== undefined),
    );

    if (numericColumns.length === 0) {
      throw new BadRequestException(
        'The uploaded file must contain at least one numeric column',
      );
    }

    const dateColumn = columns.find(
      (column) => column.toLowerCase() === 'date',
    );
    const labelColumn = type === 'line' && dateColumn ? dateColumn : columns[0];
    const valueColumns = numericColumns.filter(
      (column) => column !== labelColumn && column.toLowerCase() !== 'id',
    );
    const seriesColumns =
      type === 'pie'
        ? [valueColumns[0] ?? numericColumns[0]]
        : valueColumns.length > 0
          ? valueColumns
          : numericColumns;

    return rawRows.map((row, index) => {
      const labelValue = row[labelColumn];
      const normalized: ChartDataRow = {
        label: toLabel(
          type === 'line' && typeof labelValue === 'number'
            ? excelDateToIso(labelValue)
            : labelValue,
          index,
        ),
      };

      for (const column of seriesColumns) {
        normalized[type === 'pie' ? 'value' : column] =
          toNumber(row[column]) ?? 0;
      }

      return normalized;
    });
  }

  private normalizeLongFormLineRows(
    rawRows: RawRow[],
    columns: string[],
  ): ChartDataRow[] | undefined {
    const columnByName = new Map(
      columns.map((column) => [column.toLowerCase(), column]),
    );
    const dateColumn = columnByName.get('date');
    const seriesColumn = columnByName.get('campaign');
    const valueColumn = columnByName.get('result');

    if (!dateColumn || !seriesColumn || !valueColumn) {
      return undefined;
    }

    const rowsByDate = new Map<string, ChartDataRow>();

    for (const [index, row] of rawRows.entries()) {
      const rawDate = row[dateColumn];
      const label = toLabel(
        typeof rawDate === 'number' ? excelDateToIso(rawDate) : rawDate,
        index,
      );
      const series = toLabel(row[seriesColumn], index);
      const value = toNumber(row[valueColumn]);

      if (value === undefined) {
        continue;
      }

      const normalized = rowsByDate.get(label) ?? { label };
      normalized[series] = value;
      rowsByDate.set(label, normalized);
    }

    return Array.from(rowsByDate.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }
}
