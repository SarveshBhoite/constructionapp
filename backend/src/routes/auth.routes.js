const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Login by Mobile Number
router.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Check Worker
    let user = await prisma.worker.findUnique({
      where: { phone },
    });

    if (user) {
      return res.json({ 
        role: "labour", 
        user: { 
          id: user.id, 
          name: user.name, 
          city: user.city,
          profileImage: user.profileImage
        } 
      });
    }

    // Check Contractor
    user = await prisma.contractor.findUnique({
      where: { phone },
    });

    if (user) {
      return res.json({ 
        role: "contractor", 
        user: { 
          id: user.id, 
          name: user.name, 
          companyName: user.companyName,
          isSubscribed: user.isSubscribed
        } 
      });
    }

    res.status(404).json({ error: "User not found. Please sign up first." });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
