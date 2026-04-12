const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

// Simple, stable initialization for standard Node.js environments
const prisma = new PrismaClient();

module.exports = prisma;
