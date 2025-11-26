import React from "react";
import { X, Plane, Clock, Luggage, CheckCircle } from "lucide-react";

function FlightDetailsDialog({ flightData, isOpen, onClose }) {
	if (!isOpen || !flightData) return null;

	const segment = flightData.segment || {};
	const itinerary = flightData.itinerary || {};
	const flightOffer = flightData.flightOffer || {};
	
	// Get airline name from saved data
	const airlineData = flightOffer.airlineData || {};
	const airlineCode = segment.carrierCode;
	const airlineName = airlineData.airlineNames?.[airlineCode] || airlineCode || "Airline";
	
	const travelerPricing = flightOffer.travelerPricings?.[0] || {};
	const fareDetails = travelerPricing.fareDetailsBySegment || [];
	
	// Find fare details for this segment
	const segmentFareDetails = fareDetails.find(fd => fd.segmentId === segment.id) || {};

	// Format time
	const formatTime = (dateTimeString) => {
		if (!dateTimeString) return "N/A";
		const date = new Date(dateTimeString);
		return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
	};

	// Format date
	const formatDate = (dateTimeString) => {
		if (!dateTimeString) return "N/A";
		const date = new Date(dateTimeString);
		return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	};

	// Format duration
	const formatDuration = (duration) => {
		if (!duration) return "N/A";
		const match = duration.match(/PT(\d+H)?(\d+M)?/);
		if (match) {
			const hours = match[1] ? match[1].replace('H', '') : '0';
			const minutes = match[2] ? match[2].replace('M', '') : '0';
			return `${hours}h ${minutes}m`;
		}
		return duration;
	};

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
			<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[75vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="sticky top-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 rounded-t-2xl">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30">
								<Plane className="w-6 h-6 text-white" />
							</div>
							<div>
								<h3 className="text-white font-bold text-xl">
									{airlineName || segment.carrierCode} {segment.number}
								</h3>
								<p className="text-white/90 text-sm">
									{segment.departure?.iataCode} → {segment.arrival?.iataCode}
								</p>
							</div>
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
				<div className="p-5 space-y-4">
					{/* Flight Route */}
					<div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
						<div className="flex items-center justify-between mb-4">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-3 h-3 rounded-full bg-blue-500"></div>
									<span className="text-xs font-semibold text-gray-600 uppercase">Departure</span>
								</div>
								<p className="text-2xl font-bold text-gray-900 mb-1">
									{segment.departure?.iataCode}
								</p>
								{segment.departure?.terminal && (
									<p className="text-sm text-gray-600">Terminal {segment.departure.terminal}</p>
								)}
								<p className="text-lg font-semibold text-gray-700 mt-2">
									{formatTime(segment.departure?.at)}
								</p>
								<p className="text-xs text-gray-500">{formatDate(segment.departure?.at)}</p>
							</div>

							<div className="flex-shrink-0 mx-6">
								<div className="flex flex-col items-center">
									<Plane className="w-8 h-8 text-blue-500 transform rotate-90" />
									<div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500 mt-2 rounded-full"></div>
									<p className="text-xs text-gray-600 mt-2 font-medium">
										{formatDuration(itinerary.duration)}
									</p>
								</div>
							</div>

							<div className="flex-1 text-right">
								<div className="flex items-center justify-end gap-2 mb-2">
									<span className="text-xs font-semibold text-gray-600 uppercase">Arrival</span>
									<div className="w-3 h-3 rounded-full bg-cyan-500"></div>
								</div>
								<p className="text-2xl font-bold text-gray-900 mb-1">
									{segment.arrival?.iataCode}
								</p>
								{segment.arrival?.terminal && (
									<p className="text-sm text-gray-600">Terminal {segment.arrival.terminal}</p>
								)}
								<p className="text-lg font-semibold text-gray-700 mt-2">
									{formatTime(segment.arrival?.at)}
								</p>
								<p className="text-xs text-gray-500">{formatDate(segment.arrival?.at)}</p>
							</div>
						</div>
					</div>

					{/* Flight Details */}
					<div className="grid grid-cols-2 gap-3">
						<div className="bg-gray-50 rounded-lg p-3">
							<p className="text-xs text-gray-500 mb-1">Aircraft</p>
							<p className="font-semibold text-gray-900">{segment.aircraft?.code || "N/A"}</p>
						</div>
						<div className="bg-gray-50 rounded-lg p-3">
							<p className="text-xs text-gray-500 mb-1">Stops</p>
							<p className="font-semibold text-gray-900">
								{segment.numberOfStops === 0 ? "Non-stop" : `${segment.numberOfStops} stop(s)`}
							</p>
						</div>
						<div className="bg-gray-50 rounded-lg p-3">
							<p className="text-xs text-gray-500 mb-1">Cabin Class</p>
							<p className="font-semibold text-gray-900">{segmentFareDetails.cabin || "ECONOMY"}</p>
						</div>
						<div className="bg-gray-50 rounded-lg p-3">
							<p className="text-xs text-gray-500 mb-1">Fare Type</p>
							<p className="font-semibold text-gray-900">{segmentFareDetails.brandedFareLabel || segmentFareDetails.fareBasis || "Standard"}</p>
						</div>
					</div>

					{/* Baggage Allowance */}
					{(segmentFareDetails.includedCheckedBags || segmentFareDetails.includedCabinBags) && (
						<div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
							<h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<Luggage className="w-5 h-5 text-blue-600" />
								Baggage Allowance
							</h4>
							<div className="grid grid-cols-2 gap-3">
								{segmentFareDetails.includedCheckedBags && (
									<div>
										<p className="text-sm text-gray-600">Checked Baggage</p>
										<p className="font-semibold text-gray-900">
											{segmentFareDetails.includedCheckedBags.weight} {segmentFareDetails.includedCheckedBags.weightUnit}
										</p>
									</div>
								)}
								{segmentFareDetails.includedCabinBags && (
									<div>
										<p className="text-sm text-gray-600">Cabin Baggage</p>
										<p className="font-semibold text-gray-900">
											{segmentFareDetails.includedCabinBags.weight} {segmentFareDetails.includedCabinBags.weightUnit}
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Amenities */}
					{segmentFareDetails.amenities && segmentFareDetails.amenities.length > 0 && (
						<div>
							<h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<CheckCircle className="w-5 h-5 text-green-600" />
								Amenities & Services
							</h4>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								{segmentFareDetails.amenities.map((amenity, idx) => (
									<div
										key={idx}
										className={`flex items-center gap-2 p-3 rounded-lg ${
											amenity.isChargeable 
												? 'bg-yellow-50 border border-yellow-200' 
												: 'bg-green-50 border border-green-200'
										}`}
									>
										<CheckCircle className={`w-4 h-4 ${
											amenity.isChargeable ? 'text-yellow-600' : 'text-green-600'
										}`} />
										<div className="flex-1">
											<p className="text-sm font-medium text-gray-900">{amenity.description}</p>
											{amenity.isChargeable && (
												<p className="text-xs text-yellow-700">Chargeable</p>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Fare Breakdown */}
					{flightOffer.price && (
						<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
							<h4 className="font-semibold text-gray-900 mb-3">Fare Breakdown</h4>
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Base Fare</span>
									<span className="font-semibold text-gray-900">
										{flightOffer.price.currency} {parseFloat(flightOffer.price.base || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
									</span>
								</div>
								{flightOffer.price.fees && flightOffer.price.fees.length > 0 && (
									flightOffer.price.fees.map((fee, idx) => (
										<div key={idx} className="flex justify-between text-sm">
											<span className="text-gray-600">{fee.type}</span>
											<span className="font-semibold text-gray-900">
												{flightOffer.price.currency} {parseFloat(fee.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
											</span>
										</div>
									))
								)}
								<div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
									<span className="font-semibold text-gray-900">Total</span>
									<span className="font-bold text-lg text-gray-900">
										{flightOffer.price.currency} {parseFloat(flightOffer.price.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default FlightDetailsDialog;

