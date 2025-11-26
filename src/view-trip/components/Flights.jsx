import React from "react";
import FlightCard from "./FlightCard";

function Flights({ trip }) {
	const itinerary = trip?.tripData?.daily_itinerary || [];
	const travelMode = trip?.userSelection?.travelMode || trip?.tripData?.travel_mode_preference || "";

	// Check if user selected flight option
	const isFlightMode = travelMode.toLowerCase().includes("flight") || 
		travelMode.toLowerCase().includes("air") ||
		travelMode.toLowerCase().includes("aeroplane") ||
		travelMode.toLowerCase().includes("plane");

	// Extract flight information helper
	const extractFlightInfo = (details) => {
		if (!details) return null;
		const travelMode = details.toLowerCase();
		const isFlight = travelMode.includes("flight") || 
			travelMode.includes("air") ||
			travelMode.includes("aeroplane") ||
			travelMode.includes("plane") ||
			/\b([A-Z]{2})[\s-]?(\d{3,4})\b/.test(details) || // Flight number pattern
			/\b([A-Z]{3})\b/.test(details); // Airport code pattern
		return isFlight;
	};

	// Get flight offer data from trip - try multiple possible locations
	let flightOffer = trip?.tripData?.flightOffer || null;
	
	// Try to parse if it's a string
	if (typeof flightOffer === 'string') {
		try {
			flightOffer = JSON.parse(flightOffer);
		} catch (e) {
			console.warn("Failed to parse flightOffer string:", e);
		}
	}
	
	const flightPrice = flightOffer?.price || null;

	// Create flight cards from itineraries array - only departure and return (max 2 flights)
	const flightCards = [];
	if (flightOffer && flightOffer.itineraries && Array.isArray(flightOffer.itineraries) && flightOffer.itineraries.length > 0) {
		// Only process first two itineraries (departure and return)
		const maxItineraries = Math.min(flightOffer.itineraries.length, 2);
		for (let idx = 0; idx < maxItineraries; idx++) {
			const itinerary = flightOffer.itineraries[idx];
			const segments = itinerary.segments || [];
			
			// Process first segment of each itinerary (departure or return)
			if (segments.length > 0) {
				const segment = segments[0]; // Use first segment for main flight info
				const flightType = idx === 0 ? 'departure' : 'return';
				flightCards.push({
					itinerary: itinerary,
					segment: segment,
					flightOffer: flightOffer,
					flightType: flightType,
					itineraryIndex: idx,
					segmentIndex: 0,
				});
			}
		}
	} else {
		// Fallback: Filter days that have FLIGHT information only (not other transports)
		const flightDays = itinerary.filter((day) => {
			const travel = day?.travel || {};
			const travelMode = (travel.mode || "").toLowerCase();
			const travelDetails = (travel.details || "").toLowerCase();
			
			// Check if it's a flight
			const isFlight = travelMode.includes("flight") || 
				travelMode.includes("air") ||
				travelMode.includes("aeroplane") ||
				travelMode.includes("plane") ||
				extractFlightInfo(travel.details);
			
			return isFlight && (travel.mode || travel.details);
		});

		// Only take first two flight days (departure and return)
		const maxFlightDays = Math.min(flightDays.length, 2);
		for (let i = 0; i < maxFlightDays; i++) {
			const day = flightDays[i];
			const travel = day?.travel || {};
			const travelDetails = travel.details || "";
			
			// Extract all airport codes from the travel details
			const airportCodes = travelDetails.match(/\b([A-Z]{3})\b/g) || [];
			const uniqueAirports = [...new Set(airportCodes)];
			
			// Check if this looks like a return flight
			const hasReturnKeyword = /return|back|returning|round\s*trip/i.test(travelDetails);
			const flightType = hasReturnKeyword || i === 1 ? 'return' : 'departure';
			
			flightCards.push({
				...day,
				flightType: flightType,
				originalIndex: i,
			});
		}
	}
	
	// Ensure we only have maximum 2 flights (departure and return)
	const finalFlightCards = flightCards.slice(0, 2);


	// Don't show flights section if user didn't select flight option
	if (!isFlightMode) {
		return null;
	}

	if (finalFlightCards.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4 bg-transparent">
			{/* Section Heading with Total Price */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3 flex-1">
					<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
						✈️ Flights
					</h2>
					<div className="flex-grow border-t-2 border-cyan-200"></div>
				</div>
				{flightPrice && (
					<div className="ml-4 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl shadow-lg">
						<div className="text-xs font-semibold opacity-90 uppercase tracking-wide mb-0.5">
							Total Price
						</div>
						<div className="text-lg font-extrabold leading-tight">
							{flightPrice.currency} {parseFloat(flightPrice.total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
						</div>
					</div>
				)}
			</div>

			{/* Flight Cards Grid - No Slider, Only 2 Flights */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-transparent">
				{finalFlightCards.map((flightData, index) => {
					const key = flightData.itineraryIndex !== undefined 
						? `itinerary-${flightData.itineraryIndex}-${flightData.segmentIndex || 0}` 
						: `${flightData.originalIndex}-${flightData.flightType}-${index}`;
					
					return (
						<FlightCard 
							key={key}
							flightData={flightData}
							index={undefined}
							flightType={flightData.flightType}
						/>
					);
				})}
			</div>
		</div>
	);
}

export default Flights;

