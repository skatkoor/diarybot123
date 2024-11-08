import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigrations = async () => {
  if (!process.env.VITE_DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  neonConfig.fetchConnectionCache = true;
  const sql = neon(process.env.VITE_DATABASE_URL);
  const db = drizzle(sql);

  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: './migrations' });

  console.log('Migrations completed!');
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});