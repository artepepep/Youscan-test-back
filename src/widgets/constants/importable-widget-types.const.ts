import { WidgetType } from '../entities/widget.entity';

export const IMPORTABLE_WIDGET_TYPES = [
  'line',
  'bar',
  'stacked-bar',
  'pie',
] as const satisfies readonly WidgetType[];
