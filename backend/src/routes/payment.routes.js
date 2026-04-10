const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();
const prisma = require("../lib/prisma");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, contractorId } = req.body;

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save PENDING subscription
    await prisma.subscription.create({
      data: {
        contractorId,
        razorpayOrderId: order.id,
        amount: parseFloat(amount),
        status: "PENDING",
      },
    });

    res.json(order);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: "Could not create order" });
  }
});

// Verify Payment
router.post("/verify", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      contractorId 
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment Verified
      await prisma.subscription.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { 
          status: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id 
        },
      });

      // Update Contractor
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await prisma.contractor.upsert({
        where: { id: contractorId },
        update: { 
          isSubscribed: true,
          subExpiresAt: expiresAt
        },
        create: {
          id: contractorId,
          phone: "unknown", // Should be linked to real phone auth later
          isSubscribed: true,
          subExpiresAt: expiresAt
        }
      });

      res.json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
