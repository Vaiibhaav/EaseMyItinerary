// src/service/RazorPay/PaymentButton.jsx
import React from "react";
import axios from "axios";

export default function PaymentButton({
	amountInRupees,
	tripSummary,
	onPaymentSuccess,
}) {
	const loadRazorpay = () => {
		return new Promise((resolve) => {
			if (window.Razorpay) {
				resolve(true);
				return;
			}
			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	const handlePay = async () => {
		if (!amountInRupees || amountInRupees <= 0) {
			alert("Please select at least one option before paying!");
			return;
		}

		const res = await loadRazorpay();
		if (!res) {
			alert("Failed to load Razorpay SDK. Check your internet connection.");
			return;
		}

		try {
			const amtPaise = Math.round(amountInRupees * 100);
			const { data: order } = await axios.post(
				"http://localhost:3001/create-order",
				{
					amount: amtPaise,
					currency: "INR",
				}
			);

			const options = {
				key: import.meta.env.VITE_RAZORPAY_KEY_ID,
				amount: order.amount,
				currency: order.currency,
				name: "EaseMyItinerary",
				description: "Trip Booking Payment",
				order_id: order.id,
				handler: async function (response) {
					try {
						const verifyRes = await axios.post(
							"http://localhost:3001/verify-payment",
							response
						);

						if (verifyRes.data.success) {
							alert("✅ Payment verified successfully!");

							// Send booking email
							const user = JSON.parse(localStorage.getItem("user"));
							const userEmail = user?.email || "unknown";

							await axios.post("http://localhost:3001/send-booking-receipt", {
								email: userEmail,
								summary: tripSummary,
							});

							// 👇 Ensure navigate runs after async completes
							if (onPaymentSuccess) {
								setTimeout(onPaymentSuccess, 500);
							}
						} else {
							alert("⚠️ Payment verification failed!");
						}
					} catch (err) {
						console.error("❌ Verification error:", err);
						alert("Payment verification error!");
					}
				},
				prefill: {
					name: "Vaibhav Saxena",
					email: "vaibhav@example.com",
					contact: "9999999999",
				},
				theme: { color: "#1a73e8" },
			};

			const rzp = new window.Razorpay(options);
			rzp.open();

			rzp.on("payment.failed", function (response) {
				console.error("❌ Payment failed:", response.error);
				alert("Payment failed. Please try again.");
			});
		} catch (err) {
			console.error("❌ Payment Error:", err);
			alert("Payment initiation failed. Please try again.");
		}
	};

	return (
		<button
			onClick={handlePay}
			className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/80 transition"
		>
			Pay ₹{amountInRupees || 0}
		</button>
	);
}
