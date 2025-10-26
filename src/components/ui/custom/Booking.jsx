import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plane, Bed, Car } from "lucide-react";
import PaymentButton from "@/service/RazorPay/PaymentButton.jsx";

const Booking = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const tripData = location.state?.tripDetails;

	const [selected, setSelected] = useState([]);

	if (!tripData)
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-center">
				<p className="text-gray-500">No trip data found.</p>
			</div>
		);

	const normalizePrice = (val) => {
		if (typeof val === "number") return val;
		if (typeof val === "string")
			return Number(val.replace(/[^0-9.]/g, "")) || 0;
		return 0;
	};

	const handleSelect = (item) => {
		setSelected((prev) => {
			const exists = prev.find((i) => i.id === item.id);
			if (exists) {
				return prev.filter((i) => i.id !== item.id);
			} else {
				return [...prev, item];
			}
		});
	};

	const total = selected.reduce((sum, i) => sum + normalizePrice(i.price), 0);

	const getDescription = (item) => {
		const dateText = item.date ? ` on ${item.date}` : "";
		if (item.type?.toLowerCase().includes("flight")) {
			return `${item.name} flight from ${item.from || "your city"} to ${
				item.to || tripData.destination
			}${dateText}`;
		} else if (item.type?.toLowerCase().includes("cab")) {
			return `${item.name || "Cab"} ride${dateText}`;
		} else if (item.type?.toLowerCase().includes("hotel")) {
			return `${item.name} hotel${dateText}`;
		} else if (item.type?.toLowerCase().includes("hostel")) {
			return `${item.name} hostel${dateText}`;
		} else if (item.type?.toLowerCase().includes("transport")) {
			return `${item.name || "Transport"}${dateText}`;
		}
		return `${item.name}${dateText}`;
	};

	const getIcon = (type = "") => {
		const lower = type.toLowerCase();
		if (lower.includes("flight")) return <Plane size={18} />;
		if (lower.includes("hotel") || lower.includes("hostel"))
			return <Bed size={18} />;
		if (lower.includes("cab") || lower.includes("transport"))
			return <Car size={18} />;
		return <CalendarDays size={18} />;
	};

	const travelOptions =
		tripData.travelOptions?.map((item, idx) => ({
			...item,
			id: `travel-${idx}-${item.name}`,
			price: normalizePrice(item.price),
		})) || [];

	const stayOptions =
		tripData.stayOptions?.map((item, idx) => ({
			...item,
			id: `stay-${idx}-${item.name}`,
			price: normalizePrice(item.price),
		})) || [];

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 mt-10">
			<h1 className="text-3xl font-bold mb-6 text-primary">
				Booking for {tripData.destination}
			</h1>

			<div className="max-w-lg w-full space-y-8">
				{/* Travel Options */}
				{travelOptions.length > 0 && (
					<div className="border rounded-xl p-4 shadow-sm">
						<h2 className="text-xl font-semibold mb-4">Travel Options</h2>
						{travelOptions.map((item) => (
							<label
								key={item.id}
								className="flex justify-between items-center border-b py-3 cursor-pointer"
							>
								<div className="flex items-center gap-3">
									<span className="text-primary">{getIcon(item.type)}</span>
									<p className="font-medium text-foreground">
										{getDescription(item)}
									</p>
								</div>
								<div className="flex items-center gap-3">
									<p className="text-sm font-semibold">₹{item.price}</p>
									<input
										type="checkbox"
										onChange={() => handleSelect(item)}
										checked={selected.some((i) => i.id === item.id)}
									/>
								</div>
							</label>
						))}
					</div>
				)}

				{/* Stay Options */}
				{stayOptions.length > 0 && (
					<div className="border rounded-xl p-4 shadow-sm">
						<h2 className="text-xl font-semibold mb-4">Stay Options</h2>
						{stayOptions.map((item) => (
							<label
								key={item.id}
								className="flex justify-between items-center border-b py-3 cursor-pointer"
							>
								<div className="flex items-center gap-3">
									<span className="text-primary">{getIcon(item.type)}</span>
									<p className="font-medium text-foreground">
										{getDescription(item)}
									</p>
								</div>
								<div className="flex items-center gap-3">
									<p className="text-sm font-semibold">₹{item.price}</p>
									<input
										type="checkbox"
										onChange={() => handleSelect(item)}
										checked={selected.some((i) => i.id === item.id)}
									/>
								</div>
							</label>
						))}
					</div>
				)}

				{/* Total and Payment */}
				<div className="flex justify-between items-center mt-4">
					<h3 className="text-lg font-semibold">
						Total: ₹{total.toLocaleString()}
					</h3>

					<PaymentButton
						amountInRupees={total}
						tripSummary={{
							destination: tripData.destination,
							total,
							selected,
						}}
						onPaymentSuccess={() => {
							console.log("✅ Payment success callback triggered");
							navigate(`/view-trip/${location.state.tripId}`, {
								state: { paid: true },
							});
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default Booking;
