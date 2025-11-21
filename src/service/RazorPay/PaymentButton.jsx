// src/service/RazorPay/PaymentButton.jsx
import React from "react";
import axios from "axios";

export default function PaymentButton({
	amountInRupees,
	tripSummary,
	onPaymentSuccess,
}) {
	const BACKEND_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.BACKEND_URL ||
    "http://localhost:3001";
	
	console.log("Using BACKEND_URL:", import.meta.env.VITE_API_URL);
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

			// Create order just for consistent flow (optional)
			const { data: order } = await axios.post(
				`${BACKEND_URL}/create-order`,
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
						console.log("✅ payment confirmation...");

						const user = JSON.parse(localStorage.getItem("user"));
						const userEmail = user?.email || "vaibhavsaxena533@gmail.com";

						// Check trip summary presence
						if (!tripSummary || !tripSummary.destination) {
							console.warn("⚠️ Missing trip summary, using fallback.");
						}

						// Call email API
						const emailRes = await axios.post(
              			`${BACKEND_URL}/send-booking-receipt`,
              {
                email: userEmail,
                summary: tripSummary || {
                  destination: "Unknown Destination",
                  total: amountInRupees,
                  selected: [],
                },
              }
            );

						if (emailRes.data?.success) {
							alert("✅ Payment confirmed and booking email sent!");
						} else {
							alert("⚠️ payment done, but email may not have sent.");
						}

						if (onPaymentSuccess) {
							setTimeout(onPaymentSuccess, 500);
						}
					} catch (err) {
						console.error("❌ Mock payment flow error:", err);
						alert(
							`Error in mocked payment flow: ${
								err.response?.data?.error || err.message
							}`
						);
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
			disabled={!amountInRupees || amountInRupees <= 0}
			className="w-full bg-[#E67E22] hover:bg-[#D35400] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:shadow-none"
		>
			{amountInRupees > 0
				? `Pay ₹${amountInRupees.toLocaleString()}`
				: "Select items to pay"}
		</button>
	);
}
