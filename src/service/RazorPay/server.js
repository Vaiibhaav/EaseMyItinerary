/**
 * ============================
 * Razorpay Payment Server (Mock Success Enabled)
 * ============================
 */

import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();

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
			amount: Math.round(amount),
			currency,
			receipt: receipt || `rcpt_${Date.now()}`,
			payment_capture: 1,
		};

		const response = await axios.post(
			"https://api.razorpay.com/v1/orders",
			payload,
			{
				auth: { username: RZP_KEY_ID, password: RZP_KEY_SECRET },
				headers: { "Content-Type": "application/json" },
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

// ---------- 2️⃣ MOCKED Verify Payment ----------
app.post("/verify-payment", (req, res) => {
	console.log("⚙️ Mock verification triggered. Always returning success.");
	// Always send success so frontend continues flow
	res.json({ success: true, message: "Mock payment verified" });
});

// ---------- 3️⃣ Send Booking Receipt Email ----------
app.post("/send-booking-receipt", async (req, res) => {
	try {
		const { email, summary } = req.body;

		if (!email) {
			return res.status(400).json({ error: "Missing email" });
		}

		const safeSummary = summary || {};
		const destination = safeSummary.destination || "Unknown Destination";
		const total = safeSummary.total || 0;
		const items = Array.isArray(safeSummary.selected)
			? safeSummary.selected
			: [];

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
      <p><strong>Destination:</strong> ${destination}</p>
      <p><strong>Total Paid:</strong> ₹${total}</p>
      ${
				items.length
					? `<p>Here’s what you selected:</p><ul>${items
							.map(
								(item) =>
									`<li>${item.name} — ₹${item.price} (${
										item.type || "Item"
									})</li>`
							)
							.join("")}</ul>`
					: "<p>No specific items listed.</p>"
			}
      <p>We hope you have an amazing journey! 🌍</p>
      <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} EaseMyItinerary</p>
    `;

		const mailOptions = {
			from: `"EaseMyItinerary" <${process.env.SMTP_USER}>`,
			to: email,
			subject: `Your Booking Confirmation - ${destination}`,
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
	res.send("Razorpay Payment Server (Mock Enabled) ✅");
});

// ---------- 5️⃣ Start Server ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
