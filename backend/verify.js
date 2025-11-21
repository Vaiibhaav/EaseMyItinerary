// verify.js (server-side)
import crypto from "crypto";

function verifySignature({
	razorpay_order_id,
	razorpay_payment_id,
	razorpay_signature,
}) {
	const key_secret = import.meta.env.RAZORPAY_KEY_SECRET;
	const body = razorpay_order_id + "|" + razorpay_payment_id;
	const expectedSignature = crypto
		.createHmac("sha256", key_secret)
		.update(body.toString())
		.digest("hex");

	return expectedSignature === razorpay_signature;
}
