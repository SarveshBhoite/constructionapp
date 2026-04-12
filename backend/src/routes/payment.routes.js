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

// Verify Payment (Handles both POST from SDK and GET from Payment Link)
router.all("/verify", async (req, res) => {
  try {
    const data = req.method === 'GET' ? req.query : req.body;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      contractorId,
      workerId,
      razorpay_payment_link_id
    } = data;

    // For Payment Links, the order ID is actually the payment_link_id
    const orderId = razorpay_order_id || razorpay_payment_link_id;

    const sign = orderId + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isSimulation = razorpay_signature === 'sim_sig';
    
    // We allow a bypass for testing or if the signature matches
    if (razorpay_signature === expectedSign || isSimulation || req.method === 'GET') {
      // Payment Verified
      await prisma.subscription.updateMany({
        where: { razorpayOrderId: orderId },
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
      } else if (workerId) {
          await prisma.worker.update({
            where: { id: workerId },
            data: { isSubscribed: true, subExpiresAt: expiresAt }
          });
      }

      // If it was a browser payment, show a success page and redirect back
      if (req.method === 'GET') {
          return res.send(`
            <html>
              <body style="text-align:center; padding-top: 50px; font-family: sans-serif;">
                <h1 style="color: green;">Payment Successful!</h1>
                <p>You can now return to the app.</p>
                <script>
                  setTimeout(() => {
                    window.location.href = "exp://";
                  }, 2000);
                </script>
              </body>
            </html>
          `);
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
    
    // Dynamically get the host (IP address) so it works on phone
    const host = req.get('host'); 
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    console.log(`Creating payment link for ${role}. Callback will be: ${baseUrl}/api/payments/verify`);

    const response = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      accept_partial: false,
      description: `Subscription for ${role}`,
      customer: {
        name: "Valued User",
        contact: "919000000000",
      },
      notify: { sms: false, email: false },
      reminder_enable: false,
      notes: {
        role,
        contractorId: contractorId || "",
        workerId: workerId || ""
      },
      callback_url: `${baseUrl}/api/payments/verify`,
      callback_method: "get"
    });

    // Save PENDING status in DB
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

// Check Subscription Status by Order ID
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

// Get Worker Transactions
router.get("/status/worker/:id", async (req, res) => {
    try {
        const subs = await prisma.subscription.findMany({
            where: { userId: req.params.id, status: "SUCCESS" },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subs);
    } catch (e) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

// Get Contractor Transactions
router.get("/status/contractor/:id", async (req, res) => {
    try {
        const subs = await prisma.subscription.findMany({
            where: { contractorId: req.params.id, status: "SUCCESS" },
            orderBy: { createdAt: 'desc' }
        });
        res.json(subs);
    } catch (e) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

module.exports = router;
