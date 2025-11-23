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
	console.warn("⚠️ Missing Razorpay credentials in .env — payments will be mocked for local development.");
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
/**
 * ============================
 * Google Routes API - ComputeRoutes (Snap-to-Road)
 * ============================
 */
import fetch from "node-fetch"; // If Node <18, otherwise remove this line

const GOOGLE_ROUTES_API_KEY = process.env.GOOGLE_ROUTES_API_KEY;

if (!GOOGLE_ROUTES_API_KEY) {
	console.warn("⚠️ Missing GOOGLE_ROUTES_API_KEY in .env — /api/compute-route will return a helpful error or mock when requested.");
}

/**
 * Compute the best route using Google Routes API v2
 * Body:
 * {
 *   "locations": ["origin", "stop1", "stop2", "destination"],
 *   "travelMode": "DRIVE"
 * }
 */
app.post("/api/compute-route", async (req, res) => {
	try {
		const { locations = [], travelMode = "DRIVE" } = req.body;

		if (!Array.isArray(locations) || locations.length < 2) {
			return res
				.status(400)
				.json({ error: "At least origin and destination required" });
		}

		const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_ROUTES_API_KEY}`;

		// Required fields from Google
		const headers = {
			"Content-Type": "application/json",
			"X-Goog-FieldMask":
				"routes.polyline.geoJsonLinestring,routes.distanceMeters,routes.duration",
		};

		// Route computation body
		const computeBody = {
			origin: { address: locations[0] },
			destination: { address: locations[locations.length - 1] },
			intermediates: locations.slice(1, -1).map((l) => ({ address: l })),
			travelMode: travelMode === "WALK" ? "WALK" : "DRIVE",
			polylineQuality: "HIGH_QUALITY",
			polylineEncoding: "GEO_JSON_LINESTRING",
		};

		// Support a mock response for local development when API key is not present
		const wantsMock = req.query?.mock === "true" || req.body?.mock === true;

		if (!GOOGLE_ROUTES_API_KEY) {
			if (wantsMock) {
				const coords = locations.map((_, i) => [77.0 + i * 0.01, 28.6 + i * 0.01]);
				return res.json({
					success: true,
					mock: true,
					distanceMeters: 1000 * Math.max(1, locations.length - 1),
					duration: 60 * 60 * Math.max(1, locations.length - 1),
					geoJson: { type: "LineString", coordinates: coords },
				});
			}

			return res.status(400).json({
				success: false,
				error: "MISSING_GOOGLE_ROUTES_API_KEY",
				message:
					"Server missing GOOGLE_ROUTES_API_KEY. Set the env var or call this endpoint with ?mock=true for local testing.",
			});
		}

		// Attempt the computeRoutes call and handle non-JSON or fetch failures gracefully
		let r;
		let json;
		try {
			r = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify(computeBody),
			});

			const text = await r.text();
			try {
				json = JSON.parse(text);
			} catch {
				console.error("⚠️ ComputeRoutes returned non-JSON response:", text);
				return res.status(502).json({
					success: false,
					error: "BAD_GATEWAY",
					message: "ComputeRoutes returned an unexpected response",
					details: text,
				});
			}
		} catch (fetchErr) {
			console.error("❌ Fetch failed for ComputeRoutes:", fetchErr.message);
			return res.status(502).json({
				success: false,
				error: "FETCH_FAILED",
				message: fetchErr.message,
			});
		}

		const hasRoute =
			json &&
			json.routes &&
			json.routes.length > 0 &&
			json.routes[0].polyline &&
			json.routes[0].polyline.geoJsonLinestring;

		// Attempt 2: WALKING fallback
		if (!hasRoute) {
			computeBody.travelMode = "WALK";
			try {
				r = await fetch(url, {
					method: "POST",
					headers,
					body: JSON.stringify(computeBody),
				});
				const text2 = await r.text();
				try {
					json = JSON.parse(text2);
				} catch {
					console.error("⚠️ ComputeRoutes WALK returned non-JSON response:", text2);
					return res.status(502).json({
						success: false,
						error: "BAD_GATEWAY",
						message: "ComputeRoutes returned an unexpected response on WALK fallback",
						details: text2,
					});
				}
			} catch (fetchErr) {
				console.error("❌ Fetch failed for ComputeRoutes (WALK):", fetchErr.message);
				return res.status(502).json({
					success: false,
					error: "FETCH_FAILED",
					message: fetchErr.message,
				});
			}
		}

		if (!json || !json.routes || json.routes.length === 0) {
			return res.status(422).json({ success: false, error: "NO_ROUTE", details: json });
		}

		const route = json.routes[0];

		return res.json({
			success: true,
			distanceMeters: route.distanceMeters,
			duration: route.duration,
			geoJson: route.polyline.geoJsonLinestring,
		});
	} catch (err) {
		console.error("❌ ComputeRoutes error:", err);
		return res
			.status(500)
			.json({ error: "SERVER_ERROR", details: err.message });
	}
});
// ---------- 4️⃣ Root route ----------
app.get("/", (req, res) => {
	res.send("Razorpay Payment Server (Mock Enabled) ✅");
});

// ---------- 5️⃣ Start Server ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
