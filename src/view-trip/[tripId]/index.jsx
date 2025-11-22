import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Activities from "../components/Activities";
import Notes from "../components/Notes";
import ExpensesBreakdown from "../components/ExpensesBreakdown";
import ShareButton from "../components/ShareButton";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import getItinerary from "@/service/AIModal";

function ViewTrip() {
	const { tripId } = useParams();
	const [trip, setTrip] = useState(null);
	const [updateText, setUpdateText] = useState("");
	const [updating, setUpdating] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const isPaid = location.state?.paid || false;

	useEffect(() => {
		if (tripId) getTripData();
	}, [tripId]);

	const getTripData = async () => {
		const docRef = doc(db, "AiTrips", tripId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) setTrip(docSnap.data());
		else console.log("No such data found");
	};

	// Handle itinerary update request
	const handleUpdateItinerary = async () => {
		if (!updateText.trim()) {
			alert("Please enter your modification request first.");
			return;
		}
		if (!trip) return;

		setUpdating(true);
		try {
			const formData = trip.userSelection || {};
			const existingTrip = trip.tripData || {};

			const promptEnhancement = `
				The user wants to modify their travel itinerary with the following instruction:
				"${updateText}"

				Below is the existing itinerary JSON:
				${JSON.stringify(existingTrip, null, 2)}

				Please update this itinerary accordingly. Maintain the same structure and valid JSON schema used before.
				Ensure all changes align with user's request. Do not rewrite the entire text, only adjust relevant parts (e.g., number of days, hotels, dinner spots, activities, etc.).
				`;
			debugger
			console.log("promptEnhancement", promptEnhancement);
			// Use same AI model logic
			const updatedTrip = await getItinerary({
				...formData,
				additional_prompt: promptEnhancement,
			});

			// Save updated trip to Firestore
			await setDoc(doc(db, "AiTrips", tripId), {
				...trip,
				tripData: updatedTrip,
				updatedAt: new Date().toISOString(),
			});

			alert("✅ Itinerary updated successfully!");
			setUpdateText("");
			getTripData(); // Refresh page data
		} catch (err) {
			console.error("Error updating itinerary:", err);
			alert("❌ Failed to update itinerary. Please try again later.");
		} finally {
			setUpdating(false);
		}
	};

	if (!trip)
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
					<p className="text-gray-600 text-lg font-medium">Loading trip details...</p>
				</div>
			</div>
		);

	const itinerary = trip?.tripData?.daily_itinerary || [];
	const travelOptions = [];
	const stayOptions = [];

	itinerary.forEach((day) => {
		if (day?.budget_estimate_usd?.transport) {
			travelOptions.push({
				type: "Transport",
				name: `${day.date} Transport`,
				price: Math.round(day.budget_estimate_usd.transport * 85),
			});
		}
		if (day?.accommodation?.name) {
			stayOptions.push({
				type: "Accommodation",
				name: day.accommodation.name,
				price: Math.round(day.budget_estimate_usd.accommodation * 85 || 0),
			});
		}
	});

	const uniqueStayOptions = Object.values(
		stayOptions.reduce((acc, item) => {
			acc[item.name] = item;
			return acc;
		}, {})
	);

	const uniqueTravelOptions = Object.values(
		travelOptions.reduce((acc, item) => {
			acc[item.name] = item;
			return acc;
		}, {})
	);

	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-cyan-50 py-12 px-6 mt-12">
			{/* Animated Background Shapes */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
			</div>

			<div className="max-w-7xl mx-auto">
				{/* Info Section - Full Width */}
				<InfoSection trip={trip} />

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
					{/* Main Content - Left Side */}
					<div className="lg:col-span-2 space-y-6">
						<Hotels trip={trip} />
						<Activities trip={trip} />
						<Notes trip={trip} />
					</div>

					{/* Sidebar - Right Side */}
					<div className="lg:col-span-1 space-y-6">
						{/* Expenses Breakdown - Sticky at top */}
						<div className="sticky top-24 space-y-6">
							<ExpensesBreakdown trip={trip} />
							
							{/* Share Button */}
							<ShareButton
								tripId={tripId}
								destination={trip?.tripData?.destination}
							/>

							{/* Actions Card */}
							{!isPaid ? (
								<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-cyan-200/50 p-5">
									<h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
										✨ Customize & Book
									</h3>
									<textarea
										placeholder="Request changes to your itinerary..."
										rows="4"
										value={updateText}
										onChange={(e) => setUpdateText(e.target.value)}
										disabled={updating}
										className="w-full rounded-lg border-2 border-cyan-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all mb-3 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
									/>
									<div className="flex gap-2 mb-3">
										<Button 
											onClick={handleUpdateItinerary}
											disabled={updating}
											className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 transition-all cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
										>
											{updating ? "Updating..." : "Update"}
										</Button>
										<Button
											className="flex-1 rounded-lg py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all bg-[#E67E22] hover:bg-[#D35400] text-white border-0 cursor-pointer"
											onClick={() => {
												const destination =
													trip?.tripData?.destination || "Unknown Destination";
												const travelOpts =
													uniqueTravelOptions.length > 0
														? uniqueTravelOptions
														: [
																{
																	type: "Flight",
																	name: "IndiGo Flight",
																	price: 5500,
																},
																{ type: "Cab", name: "Ola Outstation", price: 2500 },
														  ];
												const stayOpts =
													uniqueStayOptions.length > 0
														? uniqueStayOptions
														: [
																{ type: "Hotel", name: "Marriott", price: 7000 },
																{ type: "Hostel", name: "Zostel", price: 1500 },
														  ];

												navigate("/booking", {
													state: {
														tripId,
														tripDetails: {
															destination,
															travelOptions: travelOpts,
															stayOptions: stayOpts,
														},
													},
												});
											}}
										>
											Book
										</Button>
									</div>
								</div>
							) : (
								<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-green-200 p-5 text-center">
									<div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
										<span className="text-2xl">✅</span>
									</div>
									<h3 className="text-base font-bold text-green-700 mb-1">Booking Confirmed!</h3>
									<p className="text-xs text-green-600">Receipt sent to email.</p>
								</div>
							)}

							{/* AI Assistant Card */}
							<div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-200/50 p-5">
								<div className="flex items-center gap-2 mb-3">
									<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-2">
										<Sparkles className="w-5 h-5 text-blue-600" />
									</div>
									<h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
										AI Travel Assistant
									</h3>
								</div>
								<p className="text-sm text-gray-700 leading-relaxed mb-4">
									Need assistance with flights and hotel bookings? Connect with our AI-powered travel assistant for personalized recommendations and real-time availability.
								</p>
								<Button
									onClick={() => navigate("/mcp-console")}
									className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
								>
									<MessageCircle className="w-5 h-5" />
									Talk to AI Assistant
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ViewTrip;
