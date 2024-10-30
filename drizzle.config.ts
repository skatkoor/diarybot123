import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db.ts',
  out: './migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: "postgresql://diarybotneondb_owner:k1ACUnwmYe0z@ep-frosty-mountain-a8an45qk.eastus2.azure.neon.tech/diarybotneondb?sslmode=require",
  },
} satisfies Config;