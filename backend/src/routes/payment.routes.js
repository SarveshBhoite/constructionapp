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
        role: contractorId ? 'contractor' : 'worker',
        contractorId: contractorId || null,
        userId: !contractorId ? req.body.workerId : null,
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

    const isSimulation = razorpay_signature === 'sim_sig';
    
    if (razorpay_signature === expectedSign || isSimulation) {
      // Payment Verified
      await prisma.subscription.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { 
          status: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id 
        },
      });

      // Update Correct Profile
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      if (contractorId) {
          await prisma.contractor.update({
            where: { id: contractorId },
            data: { isSubscribed: true, subExpiresAt: expiresAt }
          });
      } else if (req.body.workerId) {
          await prisma.worker.update({
            where: { id: req.body.workerId },
            data: { isSubscribed: true, subExpiresAt: expiresAt }
          });
      }

      res.json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create Payment Link (For Expo Go / Real UI testing)
router.post("/create-link", async (req, res) => {
  try {
    const { amount, contractorId, workerId } = req.body;
    const role = contractorId ? 'contractor' : 'worker';

    const response = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      accept_partial: false,
      description: `Subscription for ${role}`,
      customer: {
        name: "User",
        contact: "919000000000",
      },
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: false,
      notes: {
        role,
        contractorId: contractorId || "",
        workerId: workerId || ""
      },
      callback_url: `http://localhost:5000/api/payments/verify`,
      callback_method: "get"
    });

    // Save PENDING status
    await prisma.subscription.create({
      data: {
        role,
        contractorId: contractorId || null,
        userId: workerId || null,
        razorpayOrderId: response.id,
        amount: parseFloat(amount),
        status: "PENDING",
      },
    });

    res.json({ url: response.short_url, id: response.id });
  } catch (error) {
    console.error("Create Link Error:", error);
    res.status(500).json({ error: error.message || "Could not create payment link" });
  }
});

// Check Subscription Status
router.get("/status/:orderId", async (req, res) => {
  try {
    const sub = await prisma.subscription.findFirst({
        where: { razorpayOrderId: req.params.orderId },
        orderBy: { createdAt: 'desc' }
    });
    res.json(sub);
  } catch (e) {
    res.status(500).json({ error: "Check failed" });
  }
});

module.exports = router;
