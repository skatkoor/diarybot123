import { initializeDatabase } from '../src/lib/db.ts';

console.log('Initializing database...');
initializeDatabase()
  .then(() => {
    console.log('Database initialization completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });