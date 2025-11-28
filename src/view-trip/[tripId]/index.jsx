// ViewTrip.jsx (FINAL FIXED VERSION)

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Flights from "../components/Flights";
import Activities from "../components/Activities";
import Notes from "../components/Notes";
import ExpensesBreakdown from "../components/ExpensesBreakdown";
import ShareButton from "../components/ShareButton";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import getItinerary from "@/service/AIModal";
import MapRoutes from "../components/MapRoutes";
import getMapLocations from "@/service/getMapLocationsVerified";
import { GetPlaceDetails } from "@/service/GlobalApi";
import { toast } from "sonner";
import { SpinnerOverlay } from "@/components/ui/spinner";

function ViewTrip() {
	const { tripId } = useParams();
	const [trip, setTrip] = useState(null);
	const [mapData, setMapData] = useState(null);
	const [openMapIndex, setOpenMapIndex] = useState(null);
	const [updateText, setUpdateText] = useState("");
	const [updating, setUpdating] = useState(false);
	const [mapModalOpen, setMapModalOpen] = useState(false);
	const [mapLocations, setMapLocations] = useState([]);
	const [stepMapOpen, setStepMapOpen] = useState(false);
	const [stepLocations, setStepLocations] = useState([]);
	const [tripNotFound, setTripNotFound] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	// Check booking status from Firestore data or location state
	const isPaid = trip?.isBookingDone || location.state?.paid || false;

	// Helper function to verify location with Google Places
	const verifyLocation = async (location) => {
		if (!location || typeof location !== "string" || location.trim().length < 3) {
			console.warn("Invalid location for verification:", location);
			return location;
		}
		try {
			const trimmedLoc = location.trim();
			console.log("Verifying location:", trimmedLoc);
			const res = await GetPlaceDetails({ textQuery: trimmedLoc });
			const place = res?.data?.places?.[0];
			if (!place) {
				console.warn("No place found for:", trimmedLoc);
				return trimmedLoc;
			}
			const name = place.displayName?.text || place.name || "";
			const address = place.formattedAddress || "";
			const verified = [name, address].filter(Boolean).join(", ").trim();
			if (verified && verified.length > 0) {
				console.log("Verified location:", verified);
				return verified;
			}
			console.warn("Empty verification result, using original:", trimmedLoc);
			return trimmedLoc;
		} catch (err) {
			console.warn("Location verification failed for:", location, err?.message || err);
			return location;
		}
	};

	const openStepMap = async (from, to) => {
		// Ensure we have valid locations
		if (!from || !to) {
			console.error("Missing locations for map:", { from, to });
			toast.error("Unable to show route: Missing location information.");
			return;
		}

		// Verify locations before opening map (for older itineraries that weren't verified)
		try {
			console.log("Opening step map with locations:", { from, to });
			const verifiedFrom = await verifyLocation(from);
			const verifiedTo = await verifyLocation(to);
			
			// Ensure verified locations are valid
			if (!verifiedFrom || !verifiedTo) {
				console.error("Verification returned empty locations");
				toast.error("Unable to verify locations. Please try again.");
				return;
			}
			
			console.log("Setting step locations:", [verifiedFrom, verifiedTo]);
			setStepLocations([verifiedFrom, verifiedTo]);
			setStepMapOpen(true);
		} catch (err) {
			// Fallback to original locations if verification fails
			console.error("Location verification error:", err);
			console.log("Using original locations as fallback:", [from, to]);
			setStepLocations([from, to]);
			setStepMapOpen(true);
		}
	};

	useEffect(() => {
		if (tripId) getTripData();
	}, [tripId]);

	useEffect(() => {
		if (trip?.tripData) {
			prepareMapData();
		}
	}, [trip]);

	// LOAD MAP DATA FROM GEMINI
	async function prepareMapData() {
		try {
			const res = await getMapLocations(trip.tripData);
			setMapData(res);
		} catch (err) {
			console.error("Error preparing map data:", err);
		}
	}

	// Called when user clicks "View Map"
	const handleOpenMap = (locations) => {
		setMapLocations(locations || []);
		setMapModalOpen(true);
	};

	const getTripData = async () => {
		const docRef = doc(db, "AiTrips", tripId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			setTrip({ id: docSnap.id, ...docSnap.data() });
			setTripNotFound(false);
		} else {
			console.log("No such data found");
			setTripNotFound(true);
		}
	};

	// Handle itinerary update
	const handleUpdateItinerary = async () => {
		if (!updateText.trim()) {
			toast.error("Please enter your modification request first.");
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
			console.log("promptEnhancement", promptEnhancement);
			// Use same AI model logic

			const updatedTrip = await getItinerary({
				...formData,
				additional_prompt: promptEnhancement,
			});

			await setDoc(doc(db, "AiTrips", tripId), {
				...trip,
				tripData: updatedTrip,
				updatedAt: new Date().toISOString(),
			});

			toast.success("Itinerary updated successfully!");
			setUpdateText("");
			getTripData();
		} catch (err) {
			console.error("Error updating itinerary:", err);
			toast.error("Failed to update itinerary. Please try again later.");
		} finally {
			setUpdating(false);
		}
	};

	// Show 404 if trip not found
	if (tripNotFound) {
		return (
			<div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-cyan-50 flex flex-col items-center justify-center py-20 px-6">
				<div className="text-center max-w-md">
					<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
						<svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
						404
					</h1>
					<h2 className="text-2xl font-bold text-gray-800 mb-3">Trip Not Found</h2>
					<p className="text-gray-600 mb-8">
						The trip you're looking for doesn't exist or has been deleted.
					</p>
					<div className="flex gap-4 justify-center">
						<Button
							onClick={() => navigate("/my-trips")}
							className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
						>
							View My Trips
						</Button>
						<Button
							onClick={() => navigate("/")}
							variant="outline"
						>
							Go Home
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!trip) {
		return <SpinnerOverlay message="Loading trip details..." />;
	}

	const itinerary = trip?.tripData?.daily_itinerary || [];
	const travelOptions = [];
	const stayOptions = [];

	// Check if user selected flight mode
	const travelMode = trip?.userSelection?.travelMode || trip?.tripData?.travel_mode_preference || "";
	const isFlightMode = travelMode.toLowerCase().includes("flight") || 
		travelMode.toLowerCase().includes("air") ||
		travelMode.toLowerCase().includes("aeroplane") ||
		travelMode.toLowerCase().includes("plane");

	// Exchange rates
	const exchangeRates = {
		USD: 1,
		INR: 83,
		EUR: 0.92,
		GBP: 0.79,
		JPY: 150,
	};

	// Handle travel options
	if (isFlightMode) {
		// For flights: show total round trip price as single item
		const flightOffer = trip?.tripData?.flightOffer;
		if (flightOffer?.price) {
			const flightPrice = parseFloat(flightOffer.price.total || 0);
			const flightCurrency = flightOffer.price.currency || 'INR';
			
			// Convert to INR if needed
			const flightPriceINR = flightCurrency === 'INR' 
				? flightPrice 
				: flightPrice * (exchangeRates[flightCurrency] || exchangeRates.INR);
			
			// Show as single round trip flight
			const numItineraries = flightOffer.itineraries?.length || 0;
			const flightName = numItineraries >= 2 ? "Round Trip Flight" : "Flight";
			
			travelOptions.push({
				type: "Flight",
				name: flightName,
				price: Math.round(flightPriceINR),
				date: flightOffer.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')[0] || itinerary[0]?.date,
			});
		}
	} else {
		// For non-flight modes: show transport from daily itinerary
		itinerary.forEach((day) => {
			if (day?.budget_estimate_usd?.transport) {
				// Convert USD to INR
				const transportPriceINR = Math.round(day.budget_estimate_usd.transport * exchangeRates.INR);
				if (transportPriceINR > 0) {
					travelOptions.push({
						type: "Transport",
						name: `${day.date} Transport`,
						price: transportPriceINR,
						date: day.date,
					});
				}
			}
		});
	}

	// Handle accommodation options
	// Extract price per night from first day's accommodation notes
	const firstDay = itinerary[0];
	const firstDayNotes = firstDay?.accommodation?.notes || "";
	const priceMatch = firstDayNotes.match(/(?:Price|price):\s*([$₹€£¥]|USD|INR|EUR|GBP|JPY)?\s*(\d+(?:[.,]\d+)?)\s*per\s*night/i) 
		|| firstDayNotes.match(/(?:Price|price):\s*([$₹€£¥]|USD|INR|EUR|GBP|JPY)?\s*(\d+(?:[.,]\d+)?)/i);
	
	if (priceMatch && firstDay?.accommodation?.name) {
		const pricePerNight = parseFloat(priceMatch[2].replace(/,/g, ''));
		const currencySymbol = priceMatch[1] || null;
		
		// Currency map
		const currencyMap = {
			'$': 'USD',
			'₹': 'INR',
			'€': 'EUR',
			'£': 'GBP',
			'¥': 'JPY',
		};
		const currencyCode = currencySymbol && currencyMap[currencySymbol] 
			? currencyMap[currencySymbol]
			: (currencySymbol && ['USD', 'INR', 'EUR', 'GBP', 'JPY'].includes(currencySymbol.toUpperCase()) 
				? currencySymbol.toUpperCase() 
				: 'INR');
		
		// Convert to INR
		const pricePerNightINR = currencyCode === 'INR' 
			? pricePerNight 
			: pricePerNight * (exchangeRates[currencyCode] || exchangeRates.INR);
		
		// Calculate total accommodation cost (price per night × number of days)
		const numberOfDays = itinerary.length;
		const totalAccommodationPrice = Math.round(pricePerNightINR * numberOfDays);
		
		stayOptions.push({
			type: "Accommodation",
			name: firstDay.accommodation.name,
			price: totalAccommodationPrice,
		});
	} else {
		// Fallback: use budget estimate if price not found in notes
		let totalAccommodationUSD = 0;
		itinerary.forEach((day) => {
			if (day?.budget_estimate_usd?.accommodation) {
				totalAccommodationUSD += day.budget_estimate_usd.accommodation;
			}
		});
		if (totalAccommodationUSD > 0 && firstDay?.accommodation?.name) {
			stayOptions.push({
				type: "Accommodation",
				name: firstDay.accommodation.name,
				price: Math.round(totalAccommodationUSD * exchangeRates.INR),
			});
		}
	}

	const uniqueStayOptions = stayOptions; // Already unique
	const uniqueTravelOptions = travelOptions; // Already processed correctly

	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-cyan-50 py-12 px-6 mt-12">
			<div className="max-w-7xl mx-auto">
				{/* Info Section - Full Width */}
				<InfoSection trip={trip} />

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
					<div className="lg:col-span-2 space-y-6">
						

						<Flights trip={trip} />
						<Hotels trip={trip} onHotelUpdated={getTripData} />
						<Activities
							trip={trip}
							mapData={mapData}
							onOpenMap={handleOpenMap}
							onOpenStepMap={openStepMap}
						/>
						<Notes trip={trip} />
					</div>

					<div className="lg:col-span-1 space-y-6">
						<ExpensesBreakdown trip={trip} />
						<ShareButton
							tripId={tripId}
							destination={trip?.tripData?.destination}
						/>

						{/* Action Card */}
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
										className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 transition-all"
									>
										{updating ? "Updating..." : "Update"}
									</Button>

									<Button
										className="flex-1 rounded-lg py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all bg-[#E67E22] hover:bg-[#D35400] text-white border-0"
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
															{
																type: "Cab",
																name: "Ola Outstation",
																price: 2500,
															},
													  ];
											const stayOpts =
												uniqueStayOptions.length > 0
													? uniqueStayOptions
													: [
															{
																type: "Hotel",
																name: "Marriott",
																price: 7000,
															},
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
								<h3 className="text-base font-bold text-green-700 mb-1">
									Booking Confirmed!
								</h3>
								<p className="text-xs text-green-600">Receipt sent to email.</p>
							</div>
						)}

						{/* AI Assistant */}
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
								Need assistance with flights and hotel bookings? Connect with
								our AI-powered travel assistant for personalized recommendations
								and real-time availability.
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

			{/* DAY MAP MODAL */}
			{mapModalOpen && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
					<div className="bg-white rounded-xl w-[90%] max-w-2xl p-4 shadow-2xl relative">
						<button
							onClick={() => setMapModalOpen(false)}
							className="absolute top-2 right-2 text-gray-700 hover:text-black text-xl"
						>
							✖
						</button>

						<MapRoutes locations={mapLocations} />
					</div>
				</div>
			)}

			{/* STEP MAP MODAL */}
			{stepMapOpen && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
					<div className="bg-white rounded-xl w-[90%] max-w-2xl p-4 shadow-2xl relative">
						<button
							onClick={() => setStepMapOpen(false)}
							className="absolute top-2 right-2 text-gray-700 hover:text-black text-xl z-10"
						>
							✖
						</button>
						
						{stepLocations && stepLocations.length >= 2 ? (
							<>
								<div className="mb-2 text-sm text-gray-600">
									<strong>Route:</strong> {stepLocations[0]} → {stepLocations[1]}
								</div>
								<MapRoutes locations={stepLocations} />
							</>
						) : (
							<div className="p-8 text-center text-gray-600">
								<p className="mb-2">Unable to display route</p>
								<p className="text-sm">Locations: {JSON.stringify(stepLocations)}</p>
							</div>
						)}
					</div>
				</div>
			)}
			
			{updating && <SpinnerOverlay message="Updating your itinerary..." />}
		</div>
	);
}

export default ViewTrip;
