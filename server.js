const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const orders = {};

// Create a new order and Paystack payment session
app.post("/api/order", async (req, res) => {
  const { items, email } = req.body;
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const amountInKobo = Math.round(total * 100 * 20); // Convert ZAR to Kobo (~1 ZAR = 20 NGN)

  const orderId = uuidv4();
  orders[orderId] = { status: "Preparing", items, total };

  try {
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amountInKobo,
        metadata: { orderId },
        callback_url: https://urbanfastfood-onrender.com/order-success?orderId=${orderId}
      },
      {
        headers: {
          Authorization: Bearer ${PAYSTACK_SECRET_KEY},
          "Content-Type": "application/json",
        },
      }
    );

    // Simulate order status progression
    setTimeout(() => (orders[orderId].status = "Out for delivery"), 10000);
    setTimeout(() => (orders[orderId].status = "Delivered"), 20000);

    res.json({ orderId, authUrl: paystackRes.data.data.authorization_url });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

// Check order status
app.get("/api/status/:orderId", (req, res) => {
  const order = orders[req.params.orderId];
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ status: order.status });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(Server running on port ${PORT}));
