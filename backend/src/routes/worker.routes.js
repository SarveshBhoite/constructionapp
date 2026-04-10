const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Register Worker
router.post("/register", async (req, res) => {
  try {
    const { 
      name, phone, email, address, city, state, 
      category, categoryEn, categoryMr, 
      experienceYears, wages, wageType, profileImage 
    } = req.body;

    // Validation
    if (!name || !phone || !city || !state || !category || !wages) {
      return res.status(400).json({ error: "Mandatory fields are missing" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    const worker = await prisma.worker.create({
      data: {
        name,
        phone,
        email,
        address,
        city,
        state,
        category,
        categoryEn,
        categoryMr,
        experienceYears: parseInt(experienceYears) || 0,
        wages: parseFloat(wages),
        wageType,
        profileImage,
      },
    });

    res.status(201).json(worker);
  } catch (error) {
    console.error("Signup Error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Phone number already registered" });
    }
    // Return the actual error message to the frontend for easier debugging
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get Workers with Filters
router.get("/", async (req, res) => {
  try {
    const { category, city, query } = req.query;

    const where = {
      isAvailable: true,
    };

    if (category && category !== "null") {
      where.category = category;
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ];
    }

    const workers = await prisma.worker.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(workers);
  } catch (error) {
    console.error("Fetch Workers Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Increment View Count
router.post("/view/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.worker.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    res.json({ message: "View counted" });
  } catch (error) {
    console.error("Increment View Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Single Worker
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await prisma.worker.findUnique({
      where: { id },
    });
    res.json(worker);
  } catch (error) {
    console.error("Fetch Worker Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
