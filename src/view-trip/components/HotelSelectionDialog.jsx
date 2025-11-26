import React, { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import HotelCard from "./HotelCard";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
const ai = new GoogleGenAI({
	apiKey: API_KEY,
});

function HotelSelectionDialog({ trip, isOpen, onClose, onHotelSelected }) {
	const [hotels, setHotels] = useState([]);
	const [selectedHotel, setSelectedHotel] = useState(null);
	const [loading, setLoading] = useState(false);
	const [fetchingDetails, setFetchingDetails] = useState(false);
	const [regenerating, setRegenerating] = useState(false);

	useEffect(() => {
		if (isOpen && trip?.tripData?.availableHotels?.hotels) {
			fetchHotelDetails();
		}
	}, [isOpen, trip]);

	// Helper function to extract text from response (same as AIModal.jsx)
	const extractText = (response) => {
		if (!response) return "";

		if (typeof response === "object" && response.tripData) return null;
		if (typeof response.text === "string") return response.text;
		if (typeof response.outputText === "string") return response.outputText;

		if (Array.isArray(response.output)) {
			let combined = "";
			for (const block of response.output) {
				if (typeof block.text === "string") combined += block.text;
				if (Array.isArray(block.content)) {
					for (const item of block.content) {
						if (typeof item.text === "string") combined += item.text;
						if (typeof item.output_text === "string")
							combined += item.output_text;
					}
				}
			}
			if (combined.trim()) return combined;
		}

		if (Array.isArray(response.candidates)) {
			return response.candidates
				.map((c) => c.output_text || c.content || JSON.stringify(c))
				.join("\n");
		}

		// Try response.response.text() if it exists
		if (response.response && typeof response.response.text === "function") {
			try {
				return response.response.text();
			} catch (e) {
				console.warn("response.response.text() failed:", e);
			}
		}

		// Try accessing text directly from response
		if (response.response?.text) {
			return response.response.text;
		}

		try {
			return JSON.stringify(response);
		} catch {
			return String(response);
		}
	};

	const fetchHotelDetails = async () => {
		setFetchingDetails(true);
		try {
			const availableHotels = trip.tripData.availableHotels.hotels;
			
			// Create prompt for Gemini to get hotel details
			const prompt = `
You are an expert travel assistant. I have a list of hotels from Amadeus API. For each hotel, provide detailed information including:
- Full name
- Address (full address)
- Star rating
- Amenities (list of amenities)
- Estimated price per night in the local currency (search the web for current prices)
- Brief description

Hotel List from Amadeus API:
${JSON.stringify(availableHotels, null, 2)}

Return ONLY a valid JSON array with this structure:
[
  {
    "hotelId": "string (from Amadeus)",
    "name": "string (full hotel name)",
    "address": "string (full address)",
    "rating": "number (star rating)",
    "amenities": ["string array"],
    "pricePerNight": "number",
    "currency": "string (USD, INR, EUR, etc.)",
    "description": "string (brief description)"
  }
]

Return ONLY the JSON array, no markdown, no explanations.
`;

			const response = await ai.models.generateContent({
				model: "gemini-2.5-flash",
				contents: [{ role: "user", parts: [{ text: prompt }] }],
			});

			const text = extractText(response);
			// Extract JSON from text
			const jsonMatch = text.match(/\[[\s\S]*\]/);
			if (jsonMatch) {
				const hotelDetails = JSON.parse(jsonMatch[0]);
				setHotels(hotelDetails);
			} else {
				console.error("Failed to parse hotel details from Gemini response");
				// Fallback: use basic hotel data
				setHotels(availableHotels.map(h => ({
					hotelId: h.hotelId,
					name: h.name || "Hotel",
					address: h.address?.fullAddress || h.address?.lines?.join(", ") || "Address not available",
					rating: h.rating || h.hotelRating || null,
					amenities: h.amenities || [],
					pricePerNight: null,
					currency: "USD",
					description: "Hotel details available",
				})));
			}
		} catch (error) {
			console.error("Error fetching hotel details:", error);
			// Fallback: use basic hotel data
			const availableHotels = trip.tripData.availableHotels.hotels || [];
			setHotels(availableHotels.map(h => ({
				hotelId: h.hotelId,
				name: h.name || "Hotel",
				address: h.address?.fullAddress || h.address?.lines?.join(", ") || "Address not available",
				rating: h.rating || h.hotelRating || null,
				amenities: h.amenities || [],
				pricePerNight: null,
				currency: "USD",
				description: "Hotel details available",
			})));
		} finally {
			setFetchingDetails(false);
		}
	};

	const handleHotelSelect = (hotel) => {
		setSelectedHotel(hotel);
	};

	const handleConfirmSelection = async () => {
		if (!selectedHotel) return;

		setRegenerating(true);
		try {
			const formData = trip.userSelection || {};
			const existingTrip = trip.tripData || {};
			const availableHotels = trip.tripData.availableHotels || {};

			const prompt = `
The user wants to change their hotel selection in the itinerary.

Current Itinerary:
${JSON.stringify(existingTrip, null, 2)}

Selected New Hotel:
${JSON.stringify(selectedHotel, null, 2)}

Available Hotels List:
${JSON.stringify(availableHotels.hotels, null, 2)}

Instructions:
1. Replace the current hotel in the itinerary with the selected hotel: "${selectedHotel.name}"
2. Update accommodation.name, accommodation.location, and accommodation.notes for ALL days in the itinerary
3. Update the accommodation.notes to include:
   - Price: [currency symbol][price] per night (use the price from selected hotel or search web)
   - Rating: [X] star hotel
   - Amenities: [list of amenities from selected hotel]
4. Recalculate budget_estimate_usd.accommodation based on the new hotel price
5. Keep all other itinerary details the same (activities, travel, number of days,etc.)
6. Maintain the same JSON schema structure

Return ONLY a valid JSON object matching the original schema, no markdown, no explanations.
`;

			const response = await ai.models.generateContent({
				model: "gemini-2.5-flash",
				contents: [{ role: "user", parts: [{ text: prompt }] }],
			});

			const text = extractText(response);
			// Extract JSON from text
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				const updatedTrip = JSON.parse(jsonMatch[0]);
				
				// Update trip in Firestore
				await setDoc(doc(db, "AiTrips", trip.id), {
					...trip,
					tripData: {
						...updatedTrip,
						availableHotels: existingTrip.availableHotels, // Preserve hotel list
						flightOffer: existingTrip.flightOffer, // Preserve flight data
					},
					updatedAt: new Date().toISOString(),
				});

				alert("✅ Hotel updated successfully! The itinerary has been regenerated with your selected hotel.");
				onHotelSelected();
				onClose();
			} else {
				throw new Error("Failed to parse updated itinerary from Gemini response");
			}
		} catch (error) {
			console.error("Error regenerating itinerary:", error);
			alert("❌ Failed to update hotel. Please try again.");
		} finally {
			setRegenerating(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
			<div 
				className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col" 
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 rounded-t-2xl">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-white font-bold text-2xl mb-1">
								Select a Hotel
							</h3>
							<p className="text-white/90 text-sm">
								Choose from available hotels for your trip
							</p>
						</div>
						<button
							onClick={onClose}
							className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
						>
							<X className="w-5 h-5 text-white" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{fetchingDetails ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
							<span className="ml-3 text-gray-600">Fetching hotel details...</span>
						</div>
					) : hotels.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-600">No hotels available</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{hotels.map((hotel, index) => (
								<div
									key={hotel.hotelId || index}
									onClick={() => handleHotelSelect(hotel)}
									className={`relative cursor-pointer transition-all rounded-xl border-2 ${
										selectedHotel?.hotelId === hotel.hotelId
											? "border-blue-500 shadow-lg scale-[1.02]"
											: "border-gray-200 hover:border-blue-300"
									}`}
								>
									{/* Selection Tick */}
									{selectedHotel?.hotelId === hotel.hotelId && (
										<div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1.5 z-10 shadow-lg">
											<Check className="w-4 h-4 text-white" />
										</div>
									)}

									{/* Hotel Info */}
									<div className="p-4">
										<div className="flex items-start justify-between mb-2">
											<h4 className="font-bold text-lg text-gray-900 flex-1 pr-2">
												{hotel.name}
											</h4>
											{hotel.rating && (
												<div className="flex items-center gap-0.5 flex-shrink-0">
													{Array.from({ length: 5 }).map((_, i) => (
														<svg
															key={i}
															className={`w-4 h-4 ${i < hotel.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
															viewBox="0 0 20 20"
														>
															<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
														</svg>
													))}
												</div>
											)}
										</div>
										
										<p className="text-sm text-gray-600 mb-3 line-clamp-2">
											📍 {hotel.address}
										</p>

										{hotel.amenities && hotel.amenities.length > 0 && (
											<div className="flex flex-wrap gap-1.5 mb-3">
												{hotel.amenities.slice(0, 3).map((amenity, idx) => (
													<span
														key={idx}
														className="text-xs px-2 py-1 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200"
													>
														{amenity}
													</span>
												))}
												{hotel.amenities.length > 3 && (
													<span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
														+{hotel.amenities.length - 3}
													</span>
												)}
											</div>
										)}

										{hotel.pricePerNight && (
											<div className="mt-3 pt-3 border-t border-gray-200">
												<div className="text-xs text-gray-500 mb-1">Price per night</div>
												<div className="text-lg font-bold text-green-600">
													{hotel.currency === 'INR' ? '₹' : hotel.currency === 'USD' ? '$' : hotel.currency === 'EUR' ? '€' : hotel.currency}
													{hotel.pricePerNight.toLocaleString()}
												</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer with Confirm Button */}
				<div className="border-t border-gray-200 p-6 bg-gray-50">
					<div className="flex items-center justify-between">
						<div>
							{selectedHotel ? (
								<p className="text-sm text-gray-600">
									Selected: <span className="font-semibold text-gray-900">{selectedHotel.name}</span>
								</p>
							) : (
								<p className="text-sm text-gray-500">Please select a hotel to continue</p>
							)}
						</div>
						<button
							onClick={handleConfirmSelection}
							disabled={!selectedHotel || regenerating}
							className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
								selectedHotel && !regenerating
									? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl"
									: "bg-gray-300 text-gray-500 cursor-not-allowed"
							}`}
						>
							{regenerating ? (
								<span className="flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
									Updating Itinerary...
								</span>
							) : (
								"I want to stay in this hotel"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default HotelSelectionDialog;

