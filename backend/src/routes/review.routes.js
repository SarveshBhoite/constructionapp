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

    let avgRating = 0;
    if (allReviews.length > 0) {
        avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    }

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

// Submit a Contractor Review (Worker reviewing a Contractor)
router.post("/contractor", async (req, res) => {
  try {
    const { contractorId, workerId, workerName, rating, comment } = req.body;

    if (!contractorId || !workerId || !rating) {
      return res.status(400).json({ error: "Mandatory fields missing" });
    }

    // Save the review
    const review = await prisma.contractorReview.create({
      data: {
        contractorId,
        workerId,
        workerName: workerName || "Worker",
        rating: parseInt(rating),
        comment
      }
    });

    // Update contractor's average rating
    const allReviews = await prisma.contractorReview.findMany({
      where: { contractorId }
    });
    
    let avgRating = 0;
    if (allReviews.length > 0) {
        avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    }

    await prisma.contractor.update({
      where: { id: contractorId },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Contractor Review Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Contractor Reviews
router.get("/contractor/:id", async (req, res) => {
  try {
    const reviews = await prisma.contractorReview.findMany({
      where: { contractorId: req.params.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Fetch reviews failed" });
  }
});

module.exports = router;
