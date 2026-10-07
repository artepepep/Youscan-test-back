import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const logger = new Logger('DatabaseMigration');

async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString });

  try {
    await migrate(drizzle(pool), { migrationsFolder: 'drizzle' });
    logger.log('Database migrations completed');
  } finally {
    await pool.end();
  }
}

void runMigrations().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
