import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { WidgetImportService } from './widget-import.service';

describe('WidgetImportService', () => {
  const service = new WidgetImportService();

  it('normalizes every numeric CSV series for a stacked chart', () => {
    const result = service.parse(
      Buffer.from('month,organic,paid\nJan,12,5\nFeb,18,7'),
      'traffic.csv',
      'stacked-bar',
    );

    expect(result).toEqual({
      rows: [
        { label: 'Jan', organic: 12, paid: 5 },
        { label: 'Feb', organic: 18, paid: 7 },
      ],
    });
  });

  it('uses the first numeric XLSX series as the pie value', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([
        { channel: 'Organic', mentions: 42, reach: 100 },
        { channel: 'Paid', mentions: 16, reach: 80 },
      ]),
      'Data',
    );

    const result = service.parse(
      XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer,
      'channels.xlsx',
      'pie',
    );

    expect(result).toEqual({
      rows: [
        { label: 'Organic', value: 42 },
        { label: 'Paid', value: 16 },
      ],
    });
  });

  it('pivots long-form line data by date and campaign', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([
        { id: 2, Campaign: 'A', Date: 45600, Result: 50 },
        { id: 1, Campaign: 'B', Date: 45593, Result: 46 },
        { id: 1, Campaign: 'A', Date: 45593, Result: 48 },
      ]),
      'Line data',
    );

    const result = service.parse(
      XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer,
      'campaigns.xlsx',
      'line',
    );

    expect(result.rows).toEqual([
      { label: '2024-10-28', A: 48, B: 46 },
      { label: '2024-11-04', A: 50 },
    ]);
  });

  it('selects a matching worksheet for an XLSX chart type', () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([{ month: 'Jan', mentions: 10 }]),
      'Line data',
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([{ source: 'News', share: 75 }]),
      'Pie data',
    );

    const result = service.parse(
      XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer,
      'dashboard.xlsx',
      'pie',
    );

    expect(result.rows).toEqual([{ label: 'News', value: 75 }]);
  });

  it('rejects files without a numeric series', () => {
    expect(() =>
      service.parse(Buffer.from('name\nOrganic'), 'invalid.csv', 'bar'),
    ).toThrow(BadRequestException);
  });

  it('rejects HTML renamed to XLSX', () => {
    expect(() =>
      service.parse(
        Buffer.from('<table><tr><td>42</td></tr></table>'),
        'fake.xlsx',
        'bar',
      ),
    ).toThrow('The uploaded file is not a valid XLSX file');
  });
});
