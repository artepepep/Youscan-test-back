import { ChartDataRow } from '../../widgets/entities/widget.entity';
import { LABELS } from '../constants/labels.const';
import { randomValue } from './random-value';

export function rowsWithSeries(series: string[]): ChartDataRow[] {
  return LABELS.map((label) => ({
    label,
    ...Object.fromEntries(series.map((name) => [name, randomValue()])),
  }));
}
