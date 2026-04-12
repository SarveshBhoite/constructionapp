const { Client } = require('pg');
require('dotenv').config();

// Construct the URL with encoded password manually if needed, 
// or just use the one from .env
const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
});

async function testRawConnection() {
  console.log('Testing raw PostgreSQL connection to Supabase...');
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as connected');
    console.log('✅ SUCCESS! Connection established.');
    console.log('Database returned:', res.rows[0]);
  } catch (err) {
    console.error('❌ CONNECTION FAILED!');
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    await client.end();
  }
}

testRawConnection();
