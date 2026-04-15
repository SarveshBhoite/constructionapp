const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Get Approved Contractors with Filters
router.get("/", async (req, res) => {
  try {
    const { category, city, query, gender, minRating } = req.query;

    const where = {
      isApproved: true,
    };

    if (category && category !== "null") {
      where.categories = { has: category };
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (gender && gender !== "all") {
      where.gender = { equals: gender, mode: "insensitive" };
    }

    if (minRating && minRating !== "0") {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { companyName: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ];
    }

    const contractors = await prisma.contractor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(contractors);
  } catch (error) {
    console.error("Fetch Contractors Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Increment View Count
router.post("/view/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contractor.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    res.json({ message: "View counted" });
  } catch (error) {
    console.error("Increment View Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
