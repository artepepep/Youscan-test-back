import { WidgetData, WidgetType } from '../../widgets/entities/widget.entity';
import { rowsWithSeries } from './rows-with-series';

export function createRandomWidgetData(type: WidgetType): WidgetData {
  switch (type) {
    case 'stacked-bar':
      return { rows: rowsWithSeries(['organic', 'paid', 'referral']) };
    case 'line':
    case 'bar':
    case 'pie':
      return { rows: rowsWithSeries(['value']) };
    case 'text':
      return { content: '' };
  }
}
