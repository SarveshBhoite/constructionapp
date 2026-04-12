const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Submit a Review
router.post("/", async (req, res) => {
  try {
    const { workerId, contractorId, contractorName, rating, comment } = req.body;

    if (!workerId || !contractorId || !rating) {
      return res.status(400).json({ error: "Mandatory fields missing" });
    }

    // Save the review
    const review = await prisma.review.create({
      data: {
        workerId,
        contractorId,
        contractorName: contractorName || "Contractor",
        rating: parseInt(rating),
        comment
      }
    });

    // Update worker's average rating
    const allReviews = await prisma.review.findMany({
      where: { workerId }
    });

    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await prisma.worker.update({
      where: { id: workerId },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Worker Reviews
router.get("/worker/:id", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { workerId: req.params.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Fetch reviews failed" });
  }
});

module.exports = router;
