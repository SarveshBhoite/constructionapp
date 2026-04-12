const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Submit a Support Ticket
router.post("/ticket", async (req, res) => {
  try {
    const { role, userId, userName, message } = req.body;

    if (!role || !userId || !message) {
      return res.status(400).json({ error: "Mandatory fields missing" });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        role,
        userId,
        userName: userName || "User",
        message
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Support Ticket Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get All Tickets (for Admin)
router.get("/tickets", async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Fetch tickets failed" });
  }
});

// Update Ticket Status (for Admin)
router.patch("/ticket/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: "Update ticket failed" });
  }
});

module.exports = router;
