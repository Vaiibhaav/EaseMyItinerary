/**
 * ============================
 * Razorpay Payment Server
 * ============================
 * Features:
 *  - Creates new orders for payments
 *  - Verifies payment signatures
 *  - Sends booking confirmation emails
 *  - CORS + dotenv + JSON middleware
 */

import express from "express";
import axios from "axios";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Environment ----------
const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
	console.error("❌ Missing Razorpay credentials in .env");
	process.exit(1);
}

// ---------- 1️⃣ Create Order ----------
app.post("/create-order", async (req, res) => {
	try {
		const { amount, currency = "INR", receipt } = req.body;

		if (!amount || isNaN(amount)) {
			return res.status(400).json({ error: "Invalid amount" });
		}

		const payload = {
			amount: Math.round(amount), // Amount in paise
			currency,
			receipt: receipt || `rcpt_${Date.now()}`,
			payment_capture: 1, // auto capture payment
		};

		const response = await axios.post(
			"https://api.razorpay.com/v1/orders",
			payload,
			{
				auth: {
					username: RZP_KEY_ID,
					password: RZP_KEY_SECRET,
				},
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		console.log("✅ Order created:", response.data.id);
		res.json(response.data);
	} catch (err) {
		console.error(
			"❌ Error creating order:",
			err.response?.data || err.message
		);
		res.status(500).json({ error: "Failed to create Razorpay order" });
	}
});

// ---------- 2️⃣ Verify Payment ----------
app.post("/verify-payment", (req, res) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
			req.body;

		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return res.status(400).json({ error: "Missing payment fields" });
		}

		const body = razorpay_order_id + "|" + razorpay_payment_id;

		const expectedSignature = crypto
			.createHmac("sha256", RZP_KEY_SECRET)
			.update(body.toString())
			.digest("hex");

		const isValid = expectedSignature === razorpay_signature;

		if (isValid) {
			console.log("✅ Payment verified successfully!");
			res.json({ success: true, message: "Payment verified" });
		} else {
			console.log("❌ Invalid signature");
			res.status(400).json({ success: false, message: "Invalid signature" });
		}
	} catch (err) {
		console.error("❌ Verification error:", err.message);
		res.status(500).json({ error: "Payment verification failed" });
	}
});

// ---------- 3️⃣ Send Booking Receipt Email ----------
app.post("/send-booking-receipt", async (req, res) => {
	try {
		const { email, summary } = req.body;

		if (!email || !summary) {
			return res.status(400).json({ error: "Missing email or summary" });
		}

		// Gmail SMTP configuration
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		const htmlBody = `
      <h2>Booking Confirmation - EaseMyItinerary</h2>
      <p>Hi there,</p>
      <p>Thank you for booking your trip with <strong>EaseMyItinerary</strong>!</p>
      <p><strong>Destination:</strong> ${summary.destination}</p>
      <p><strong>Total Paid:</strong> ₹${summary.total}</p>
      <p>Here’s what you selected:</p>
      <ul>
        ${summary.selected
					.map(
						(item) =>
							`<li>${item.name} — ₹${item.price} (${item.type || "Item"})</li>`
					)
					.join("")}
      </ul>
      <p>We hope you have an amazing journey! 🌍</p>
      <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} EaseMyItinerary</p>
    `;

		const mailOptions = {
			from: `"EaseMyItinerary" <${process.env.SMTP_USER}>`,
			to: email,
			subject: `Your Booking Confirmation - ${summary.destination}`,
			html: htmlBody,
		};

		await transporter.sendMail(mailOptions);
		console.log("📧 Booking receipt sent to:", email);

		res.json({ success: true });
	} catch (err) {
		console.error("❌ Email sending failed:", err);
		res.status(500).json({ error: "Failed to send booking receipt" });
	}
});

// ---------- 4️⃣ Root route ----------
app.get("/", (req, res) => {
	res.send("Razorpay Payment Server is running ✅");
});

// ---------- 5️⃣ Start Server ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
