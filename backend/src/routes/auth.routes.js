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
          profileImage: user.profileImage,
          isSubscribed: user.isSubscribed,
          views: user.views
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
          isSubscribed: user.isSubscribed,
          isApproved: user.isApproved
        } 
      });
    }

    res.status(404).json({ error: "User not found. Please sign up first." });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Current Profile (to refresh status)
router.get("/profile/:role/:id", async (req, res) => {
  try {
    const { role, id } = req.params;
    let user;

    if (role === "labour") {
      user = await prisma.worker.findUnique({ where: { id } });
    } else {
      user = await prisma.contractor.findUnique({ where: { id } });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Contractor Registration
router.post("/register/contractor", async (req, res) => {
  console.log("--- CONTRACTOR SIGNUP ATTEMPT ---");
  console.log("Payload:", req.body);
  try {
    const { name, phone, companyName, city, idProof } = req.body;
    
    // Check if exists
    const existing = await prisma.contractor.findUnique({ where: { phone } });
    if (existing) {
        console.log("Registration Failed: Phone number already exists", phone);
        return res.status(400).json({ error: "Phone number already registered" });
    }

    const contractor = await prisma.contractor.create({
      data: {
        name,
        phone,
        companyName,
        idProof,
        isApproved: false,
        isSubscribed: false
      }
    });

    console.log("Registration Success! ID:", contractor.id);
    res.status(201).json(contractor);
  } catch (error) {
    console.error("Contractor Registration ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update Profile
router.put("/profile/:role/:id", async (req, res) => {
  try {
    const { role, id } = req.params;
    const updateData = req.body;

    // Filter out sensitive fields
    const { id: _, phone: __, password: ___, ...safeData } = updateData;

    let user;
    if (role === "labour") {
      user = await prisma.worker.update({
        where: { id },
        data: safeData
      });
    } else {
      user = await prisma.contractor.update({
        where: { id },
        data: safeData
      });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
