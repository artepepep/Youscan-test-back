import { ChartDataRow } from '../../widgets/entities/widget.entity';
import { LABELS } from '../constants/labels.const';
import { randomValue } from './random-value';

export function rowsWithSeries(
  series: string[],
  labels: readonly string[] = LABELS,
): ChartDataRow[] {
  return labels.map((label) => ({
    label,
    ...Object.fromEntries(series.map((name) => [name, randomValue()])),
  }));
}
