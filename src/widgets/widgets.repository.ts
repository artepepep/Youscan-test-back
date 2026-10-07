import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, max } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.constants';
import type { DrizzleDatabase } from '../database/database.types';
import { NewWidget, Widget, widgets } from './entities/widget.entity';

@Injectable()
export class WidgetsRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDatabase,
  ) {}

  findAll(): Promise<Widget[]> {
    return this.db.select().from(widgets).orderBy(asc(widgets.position));
  }

  async findById(id: string): Promise<Widget | undefined> {
    const [widget] = await this.db
      .select()
      .from(widgets)
      .where(eq(widgets.id, id))
      .limit(1);
    return widget;
  }

  async getNextPosition(): Promise<number> {
    const [result] = await this.db
      .select({ maximumPosition: max(widgets.position) })
      .from(widgets);
    return result.maximumPosition === null ? 0 : result.maximumPosition + 1;
  }

  async create(widget: NewWidget): Promise<Widget> {
    const [created] = await this.db.insert(widgets).values(widget).returning();
    return created;
  }

  async update(
    id: string,
    values: Partial<Pick<NewWidget, 'title' | 'data'>>,
  ): Promise<Widget | undefined> {
    const [updated] = await this.db
      .update(widgets)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(widgets.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(widgets)
      .where(eq(widgets.id, id))
      .returning({ id: widgets.id });
    return deleted.length > 0;
  }
}
