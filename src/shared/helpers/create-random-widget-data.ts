import { WidgetData, WidgetType } from '../../widgets/entities/widget.entity';
import { rowsWithSeries } from './rows-with-series';

const RANDOM_LINE_POINT_COUNT = 6;

function createRecentWeeklyLabels(): string[] {
  const today = new Date();
  const currentMonday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const daysSinceMonday = (currentMonday.getUTCDay() + 6) % 7;
  currentMonday.setUTCDate(currentMonday.getUTCDate() - daysSinceMonday);

  return Array.from({ length: RANDOM_LINE_POINT_COUNT }, (_, index) => {
    const date = new Date(currentMonday);
    const weeksAgo = RANDOM_LINE_POINT_COUNT - index - 1;
    date.setUTCDate(date.getUTCDate() - weeksAgo * 7);
    return date.toISOString().slice(0, 10);
  });
}

export function createRandomWidgetData(type: WidgetType): WidgetData {
  switch (type) {
    case 'stacked-bar':
      return { rows: rowsWithSeries(['organic', 'paid', 'referral']) };
    case 'line':
      return {
        rows: rowsWithSeries(['value'], createRecentWeeklyLabels()),
      };
    case 'bar':
    case 'pie':
      return { rows: rowsWithSeries(['value']) };
    case 'text':
      return { content: '' };
  }
}
