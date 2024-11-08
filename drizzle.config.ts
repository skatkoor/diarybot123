import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.VITE_DATABASE_URL) {
  throw new Error('VITE_DATABASE_URL environment variable is not set');
}

export default {
  schema: './src/lib/db.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.VITE_DATABASE_URL,
  },
} satisfies Config;