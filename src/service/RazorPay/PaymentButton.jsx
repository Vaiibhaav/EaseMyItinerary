// src/service/RazorPay/PaymentButton.jsx
import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function PaymentButton({
	amountInRupees,
	tripSummary,
	tripId,
	onPaymentSuccess,
	onEmailSending,
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
			toast.error("Please select at least one option before paying!");
			return;
		}

		const res = await loadRazorpay();
		if (!res) {
			toast.error("Failed to load Razorpay SDK. Check your internet connection.");
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
			const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

			const options = {
				key: razorpayKeyId,
				amount: order.amount,
				currency: order.currency,
				name: "EaseMyItinerary",
				description: "Trip Booking Payment",
				order_id: order.id,
				handler: async function (response) {
					try {
						console.log("Payment confirmed.", response);

						const user = JSON.parse(localStorage.getItem("user"));
						const userEmail = user?.email || "vaibhavsaxena533@gmail.com";

						// Store transaction ID and booking status in Firestore
						if (tripId) {
							try {
								const tripRef = doc(db, "AiTrips", tripId);
								await updateDoc(tripRef, {
									isBookingDone: true,
									transactionID: response.razorpay_payment_id || response.payment_id || response.id,
									bookingDate: new Date().toISOString(),
									bookingAmount: amountInRupees,
								});
								console.log("Booking status saved to Firestore");
							} catch (firestoreErr) {
								console.error(" Error saving booking status:", firestoreErr);
								// Don't fail the payment flow if Firestore update fails
							}
						}

						// Show toast that booking is done
						toast.success("Booking confirmed successfully!");

						// Show full-page loader while sending email
						if (onEmailSending) {
							onEmailSending(true);
						}

						// Check trip summary presence
						if (!tripSummary || !tripSummary.destination) {
							console.warn("⚠️ Missing trip summary, using fallback.");
						}

						try {
							const emailRes = await axios.post(
								`${BACKEND_URL}/send-booking-receipt`, {
									email: userEmail,
									summary: tripSummary || {
										destination: "Unknown Destination",
										total: amountInRupees,
										selected: [],
									},
								}
							);

							// Hide loader
							if (onEmailSending) {
								onEmailSending(false);
							}

							if (emailRes.data?.success) {
								toast.success("Booking receipt has been sent to your email.");
							} else {
								toast.info("Booking confirmed. Email receipt could not be sent.");
							}
						} catch (emailErr) {
							// Hide loader
							if (onEmailSending) {
								onEmailSending(false);
							}
							toast.info("Booking confirmed. Email receipt could not be sent.");
						}

						if (onPaymentSuccess) {
							setTimeout(onPaymentSuccess, 500);
						}
					} catch (err) {
						console.error("Payment handler error:", err);
						// Hide loader in case of error
						if (onEmailSending) {
							onEmailSending(false);
						}
						if (onPaymentSuccess) {
							setTimeout(onPaymentSuccess, 500);
						}
					}
				},
				theme: { color: "#1a73e8" },
			};

			const rzp = new window.Razorpay(options);
			rzp.open();

			rzp.on("payment.failed", function (response) {
				console.error(" Payment failed:", response.error);
				toast.error("Payment failed. Please try again.");
			});
		} catch (err) {
			console.error(" Payment Error:", err);
			toast.error("Payment initiation failed. Please try again.");
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
