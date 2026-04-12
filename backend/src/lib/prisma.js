const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

// Use the correct Prisma 7 property name: datasourceUrl
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

module.exports = prisma;
