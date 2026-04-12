const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  console.log('Attempting to connect to Supabase...');
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ SUCCESS! Your connection string and password are correct.');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ CONNECTION FAILED!');
    console.error('Error details:', error.message);
    if (error.message.includes('Authentication failed')) {
      console.error('👉 Tip: Double check your database password (#Raj2804#@%)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
