import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createRandomWidgetData } from '../shared/helpers/create-random-widget-data';
import { WidgetImportService } from './services/widget-import.service';
import { WidgetsRepository } from './widgets.repository';
import { WidgetsService } from './widgets.service';

describe('WidgetsService', () => {
  const repository = {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    getNextPosition: jest.fn(),
    update: jest.fn(),
  };
  const service = new WidgetsService(
    repository as unknown as WidgetsRepository,
    new WidgetImportService(),
  );

  beforeEach(() => {
    jest.resetAllMocks();
    repository.getNextPosition.mockResolvedValue(3);
    repository.create.mockImplementation((widget: object) =>
      Promise.resolve({ id: 'widget-id', ...widget }),
    );
  });

  it('creates randomized chart data on the server', async () => {
    await service.create({ type: 'line' });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'line',
        title: 'Line chart',
        position: 3,
        data: { rows: expect.any(Array) as unknown[] },
      }),
    );

    const lineData = createRandomWidgetData('line');

    if (!('rows' in lineData)) {
      throw new Error('Line widget data must contain chart rows');
    }

    expect(lineData.rows).toHaveLength(6);
    expect(
      lineData.rows.every((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.label)),
    ).toBe(true);
  });

  it('does not accept text content for chart widgets', async () => {
    await expect(
      service.create({ type: 'bar', content: 'not chart data' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('only updates content on text widgets', async () => {
    repository.findById.mockResolvedValue({ id: 'widget-id', type: 'pie' });

    await expect(
      service.update('widget-id', { content: 'Updated' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns not found when deletion affects no widget', async () => {
    repository.delete.mockResolvedValue(false);

    await expect(service.remove('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
