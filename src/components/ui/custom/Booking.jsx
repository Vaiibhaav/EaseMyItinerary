import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plane, Bed, Car, ArrowLeft, CheckCircle2 } from "lucide-react";
import PaymentButton from "@/service/RazorPay/PaymentButton.jsx";

const Booking = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const tripData = location.state?.tripDetails;

	// Auto-select all accommodation and transport options (required for booking)
	const [selected, setSelected] = useState([]);

	useEffect(() => {
		if (tripData) {
			const allOptions = [
				...(tripData.travelOptions || []),
				...(tripData.stayOptions || [])
			];
			const autoSelected = allOptions.map((item, idx) => ({
				...item,
				id: item.type?.toLowerCase().includes("transport") || item.type?.toLowerCase().includes("flight") || item.type?.toLowerCase().includes("cab")
					? `travel-${idx}-${item.name}`
					: `stay-${idx}-${item.name}`,
				price: typeof item.price === "number" ? item.price : Number(String(item.price).replace(/[^0-9.]/g, "")) || 0,
			}));
			setSelected(autoSelected);
		}
	}, [tripData]);

	if (!tripData)
		return (
			<div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 flex flex-col items-center justify-center text-center p-6">
				<div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-cyan-200/50 p-12 max-w-md">
					<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
						<CalendarDays className="w-10 h-10 text-blue-600" />
					</div>
					<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-3">
						No Trip Data Found
					</h2>
					<p className="text-gray-600 mb-6">
						It seems you haven't selected any trip details yet.
					</p>
					<Button
						onClick={() => navigate("/")}
						className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-full px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back to Home
					</Button>
				</div>
			</div>
		);

	const normalizePrice = (val) => {
		if (typeof val === "number") return val;
		if (typeof val === "string")
			return Number(val.replace(/[^0-9.]/g, "")) || 0;
		return 0;
	};

	// Accommodation and transport are required and cannot be deselected
	const handleSelect = (item) => {
		// Do nothing - accommodation and transport are always selected
	};

	const total = selected.reduce((sum, i) => sum + normalizePrice(i.price), 0);

	const getDescription = (item) => {
		// For travel options, just show the name (e.g., "Round Trip Flight", "Transport")
		if (item.type?.toLowerCase().includes("flight") || 
			item.type?.toLowerCase().includes("cab") || 
			item.type?.toLowerCase().includes("transport")) {
			return item.name;
		}
		// For accommodation, show the name
		if (item.type?.toLowerCase().includes("hotel") || 
			item.type?.toLowerCase().includes("accommodation") || 
			item.type?.toLowerCase().includes("hostel")) {
			return item.name;
		}
		return item.name;
	};

	const getIcon = (type = "") => {
		const lower = type.toLowerCase();
		if (lower.includes("flight")) return <Plane size={20} className="text-blue-600" />;
		if (lower.includes("hotel") || lower.includes("hostel"))
			return <Bed size={20} className="text-cyan-600" />;
		if (lower.includes("cab") || lower.includes("transport"))
			return <Car size={20} className="text-sky-600" />;
		return <CalendarDays size={20} className="text-blue-500" />;
	};

	const isSelected = (item) => selected.some((i) => i.id === item.id);

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
		<div className="min-h-screen bg-gradient-to-b from-blue-50 via-cyan-50 to-blue-50 py-12 px-6 relative overflow-hidden">
			{/* Animated Background Shapes */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/5 rounded-full blur-3xl"></div>
			</div>

			<div className="max-w-4xl mx-auto mt-16 relative z-10">
				{/* Header Section */}
				<div className="text-center mb-10">
					<button
						onClick={() => navigate(-1)}
						className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Itinerary
					</button>
					<h1 className="font-extrabold text-4xl md:text-5xl mb-4">
						<span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
							Complete Your Booking
						</span>
					</h1>
					<p className="text-xl text-gray-700 font-medium">
						{tripData.destination}
					</p>
					<p className="text-sm text-gray-600 mt-2">
						Accommodation and transportation are included in your booking
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Options */}
					<div className="lg:col-span-2 space-y-6">
						{/* Travel Options */}
						{travelOptions.length > 0 && (
							<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-200/50 p-6 hover:shadow-2xl transition-all duration-300">
								<div className="flex items-center gap-3 mb-5">
									<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-3">
										<Plane className="w-6 h-6 text-blue-600" />
									</div>
									<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
										Travel Options
									</h2>
								</div>
								<div className="space-y-3">
									{travelOptions.map((item) => (
										<div
											key={item.id}
											className={`group relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
												isSelected(item)
													? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400 shadow-md"
													: "bg-gray-50/50 border-2 border-gray-200"
											}`}
										>
											<div className="flex items-center gap-4 flex-1">
												<div className={`p-2 rounded-lg transition-colors ${
													isSelected(item) ? "bg-blue-100" : "bg-white group-hover:bg-blue-50"
												}`}>
													{getIcon(item.type)}
												</div>
												<div className="flex-1">
													<p className="font-semibold text-gray-800 text-sm">
														{getDescription(item)}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<span className="text-lg font-bold text-gray-800">
													₹{item.price.toLocaleString()}
												</span>
												<div className="w-6 h-6 rounded-full border-2 flex items-center justify-center bg-blue-600 border-blue-600">
													<CheckCircle2 className="w-5 h-5 text-white" fill="currentColor" />
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Stay Options */}
						{stayOptions.length > 0 && (
							<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-cyan-200/50 p-6 hover:shadow-2xl transition-all duration-300">
								<div className="flex items-center gap-3 mb-5">
									<div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full p-3">
										<Bed className="w-6 h-6 text-cyan-600" />
									</div>
									<h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
										Stay Options
									</h2>
								</div>
								<div className="space-y-3">
									{stayOptions.map((item) => (
										<div
											key={item.id}
											className={`group relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
												isSelected(item)
													? "bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-400 shadow-md"
													: "bg-gray-50/50 border-2 border-gray-200"
											}`}
										>
											<div className="flex items-center gap-4 flex-1">
												<div className={`p-2 rounded-lg transition-colors ${
													isSelected(item) ? "bg-cyan-100" : "bg-white group-hover:bg-cyan-50"
												}`}>
													{getIcon(item.type)}
												</div>
												<div className="flex-1">
													<p className="font-semibold text-gray-800 text-sm">
														{getDescription(item)}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<span className="text-lg font-bold text-gray-800">
													₹{item.price.toLocaleString()}
												</span>
												<div className="w-6 h-6 rounded-full border-2 flex items-center justify-center bg-cyan-600 border-cyan-600">
													<CheckCircle2 className="w-5 h-5 text-white" fill="currentColor" />
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Right Column - Summary */}
					<div className="lg:col-span-1">
						<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-cyan-200/50 p-6 sticky top-24">
							<h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-6">
								Booking Summary
							</h3>
							
							{/* Selected Items */}
							{selected.length > 0 ? (
								<div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
									{selected.map((item) => (
										<div key={item.id} className="flex justify-between items-start text-sm bg-blue-50/50 p-3 rounded-lg">
											<span className="text-gray-700 flex-1 pr-2">{item.name}</span>
											<span className="font-semibold text-gray-800 whitespace-nowrap">
												₹{item.price.toLocaleString()}
											</span>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 mb-6">
									<div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
										<CalendarDays className="w-8 h-8 text-gray-400" />
									</div>
									<p className="text-gray-500 text-sm">
										No items selected yet
									</p>
								</div>
							)}

							{/* Divider */}
							<div className="border-t-2 border-gray-200 my-6"></div>

							{/* Total */}
							<div className="flex justify-between items-center mb-6">
								<span className="text-lg font-bold text-gray-800">Total Amount</span>
								<span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
									₹{total.toLocaleString()}
								</span>
							</div>

							{/* Payment Button */}
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

							{/* Info Text */}
							<p className="text-xs text-gray-500 text-center mt-4">
								Secure payment powered by Razorpay
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Booking;
