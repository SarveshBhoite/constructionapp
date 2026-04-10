const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Get Pending Contractors
router.get("/pending-contractors", async (req, res) => {
  try {
    const contractors = await prisma.contractor.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
    });
    res.json(contractors);
  } catch (error) {
    console.error("Fetch Pending Contractors Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Approve Contractor
router.post("/approve-contractor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const contractor = await prisma.contractor.update({
      where: { id },
      data: { isApproved: true },
    });
    res.json({ message: "Contractor approved successfully", contractor });
  } catch (error) {
    console.error("Approve Contractor Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reject/Delete Contractor
router.delete("/reject-contractor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contractor.delete({
      where: { id },
    });
    res.json({ message: "Contractor rejected and removed" });
  } catch (error) {
    console.error("Reject Contractor Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
