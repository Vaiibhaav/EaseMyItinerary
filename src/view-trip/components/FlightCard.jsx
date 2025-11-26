import React, { useState } from "react";
import { Plane, Clock, ExternalLink } from "lucide-react";
import FlightDetailsDialog from "./FlightDetailsDialog";

function FlightCard({ flightData, index, flightType = 'single' }) {
	const [showDialog, setShowDialog] = useState(false);

	// Check if we have structured flight data from API
	const hasStructuredData = flightData?.segment && flightData?.itinerary;
	
	let segment, itinerary, day, travelDetails, travelMode;
	let airlineName = null;
	let checkInUrl = null;
	
	if (hasStructuredData) {
		// Use structured data from flight offer
		segment = flightData.segment;
		itinerary = flightData.itinerary;
		
		// Get airline data from saved flightOffer
		const flightOffer = flightData.flightOffer || {};
		const airlineData = flightOffer.airlineData || {};
		const airlineCode = segment.carrierCode;
		if (airlineCode) {
			// Get airline name from saved data
			airlineName = airlineData.airlineNames?.[airlineCode] || null;
			
			// Get check-in URL from saved data
			checkInUrl = airlineData.checkInUrls?.[airlineCode] || null;
		}
	} else {
		// Fallback to parsing from day travel details
		day = flightData;
		const travel = day?.travel || {};
		travelMode = travel.mode || "";
		travelDetails = travel.details || "";
	}

	// Format time
	const formatTime = (dateTimeString) => {
		if (!dateTimeString) return null;
		const date = new Date(dateTimeString);
		return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
	};

	// Format duration
	const formatDuration = (duration) => {
		if (!duration) return null;
		const match = duration.match(/PT(\d+H)?(\d+M)?/);
		if (match) {
			const hours = match[1] ? match[1].replace('H', '') : '0';
			const minutes = match[2] ? match[2].replace('M', '') : '0';
			return `${hours}h ${minutes}m`;
		}
		return duration;
	};


	if (!hasStructuredData && !day) {
		return null;
	}

	const departureAirport = segment?.departure?.iataCode;
	const arrivalAirport = segment?.arrival?.iataCode;
	const departureTime = segment?.departure?.at ? formatTime(segment.departure.at) : null;
	const arrivalTime = segment?.arrival?.at ? formatTime(segment.arrival.at) : null;
	const departureTerminal = segment?.departure?.terminal;
	const arrivalTerminal = segment?.arrival?.terminal;
	const duration = itinerary?.duration ? formatDuration(itinerary.duration) : null;
	const stops = segment?.numberOfStops === 0 ? "Non-stop" : segment?.numberOfStops ? `${segment.numberOfStops} stop(s)` : null;
	const flightNumber = segment ? `${segment.carrierCode} ${segment.number}` : null;

	return (
		<>
			<div 
				className="bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 transition-all hover:-translate-y-2 overflow-hidden cursor-pointer group flex-1 flex flex-col"
				onClick={() => hasStructuredData && setShowDialog(true)}
			>
				{/* Flight Header with Gradient */}
				<div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 overflow-hidden">
					{/* Background Pattern */}
					<div className="absolute inset-0 opacity-10">
						<div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
						<div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
					</div>
					<div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5"></div>
					
					{/* Flight Type Badge */}
					<div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg z-10 border border-gray-200">
						{flightType === 'return' ? 'Return' : flightType === 'departure' ? 'Departure' : 'Flight'}
					</div>

					{/* Flight Icon and Mode */}
					<div className="relative z-10">
						<div className="flex items-center gap-3 mb-2">
							<div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30 shadow-lg">
								<Plane className="w-6 h-6 text-white" />
							</div>
							<div>
								<h3 className="text-white font-bold text-xl drop-shadow-md">
									{airlineName || segment?.carrierCode || "Flight"}
								</h3>
								{flightNumber && (
									<p className="text-white/95 text-sm font-medium mt-0.5">
										{flightNumber}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Flight Details */}
				<div className="p-6 flex flex-col flex-1 relative bg-gradient-to-b from-white to-gray-50">
					{/* Route Information */}
					{(departureAirport || arrivalAirport) && (
						<div className="mb-4">
							<div className="flex items-center justify-between mb-3">
								{/* Departure */}
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-1">
										<div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
										<span className="text-xs font-semibold text-gray-500 uppercase">
											Departure
										</span>
									</div>
									<p className="text-2xl font-bold text-gray-900">
										{departureAirport || "---"}
									</p>
									{departureTime && (
										<p className="text-sm text-gray-600 mt-1 flex items-center">
											<Clock className="w-3 h-3 mr-1" />
											{departureTime}
										</p>
									)}
									{departureTerminal && (
										<p className="text-xs text-gray-500 mt-1">
											Terminal {departureTerminal}
										</p>
									)}
								</div>

								{/* Arrow with Animation */}
								<div className="flex-shrink-0 mx-4">
									<div className="flex flex-col items-center">
										<Plane className="w-6 h-6 text-blue-500 transform rotate-90 animate-pulse" />
										<div className="w-16 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500 mt-1 rounded-full"></div>
									</div>
								</div>

								{/* Arrival */}
								<div className="flex-1 text-right">
									<div className="flex items-center justify-end gap-2 mb-1">
										<span className="text-xs font-semibold text-gray-500 uppercase">
											Arrival
										</span>
										<div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
									</div>
									<p className="text-2xl font-bold text-gray-900">
										{arrivalAirport || "---"}
									</p>
									{arrivalTime && (
										<p className="text-sm text-gray-600 mt-1 flex items-center justify-end">
											<Clock className="w-3 h-3 mr-1" />
											{arrivalTime}
										</p>
									)}
									{arrivalTerminal && (
										<p className="text-xs text-gray-500 mt-1 text-right">
											Terminal {arrivalTerminal}
										</p>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Flight Details - Duration, Stops, etc. */}
					{(duration || stops) && (
						<div className="mb-4 flex flex-wrap gap-2">
							{duration && (
								<span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
									Duration: {duration}
								</span>
							)}
							{stops && (
								<span className="text-xs px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full font-medium border border-cyan-200">
									{stops}
								</span>
							)}
						</div>
					)}

					{/* Check-in Button and View Details */}
					<div className="flex items-center justify-end mt-auto pt-4 border-t border-gray-200 gap-2">
						{checkInUrl ? (
							<a
								href={checkInUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl group/btn flex-shrink-0"
								onClick={(e) => e.stopPropagation()}
							>
								<ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
								<span>Check-in</span>
							</a>
						) : hasStructuredData && (
							<div className="text-xs text-gray-500 italic">
								Check-in link not available
							</div>
						)}
						{hasStructuredData && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowDialog(true);
								}}
								className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all"
							>
								View Details
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Flight Details Dialog */}
			{hasStructuredData && (
				<FlightDetailsDialog
					flightData={flightData}
					isOpen={showDialog}
					onClose={() => setShowDialog(false)}
				/>
			)}
		</>
	);
}

export default FlightCard;
