import { db, testConnection } from './db';

async function runDatabaseTests() {
  try {
    // Test basic connection
    const connectionTest = await testConnection();
    console.log('Connection test result:', connectionTest);

    if (!connectionTest.success) {
      throw new Error('Failed to connect to database');
    }

    console.log('All database tests completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Database tests failed:', error);
    return { success: false, error };
  }
}

// Run the tests
runDatabaseTests()
  .then(result => console.log('Test suite completed:', result))
  .catch(error => console.error('Test suite failed:', error));