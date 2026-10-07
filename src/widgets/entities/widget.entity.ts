import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const WIDGET_TYPES = [
  'line',
  'bar',
  'stacked-bar',
  'pie',
  'text',
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export type ChartDataRow = {
  label: string;
  [series: string]: string | number;
};

export type ChartWidgetData = { rows: ChartDataRow[] };
export type TextWidgetData = { content: string };
export type WidgetData = ChartWidgetData | TextWidgetData;

export const widgetTypeEnum = pgEnum('widget_type', WIDGET_TYPES);

export const widgets = pgTable('widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: widgetTypeEnum('type').notNull(),
  title: varchar('title', { length: 120 }).notNull(),
  data: jsonb('data').$type<WidgetData>().notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;
