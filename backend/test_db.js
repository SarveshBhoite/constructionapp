const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function test() {
    console.log("Testing Database connection...");
    try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        console.log("Fetching pending contractors...");
        const contractors = await prisma.contractor.findMany({
            where: { isApproved: false }
        });
        console.log("Success! Found:", contractors.length);
        process.exit(0);
    } catch (error) {
        console.error("Database Test Failed!");
        console.error(error);
        process.exit(1);
    }
}

test();
