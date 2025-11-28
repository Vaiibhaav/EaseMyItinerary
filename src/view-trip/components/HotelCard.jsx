import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPlaceDetails, PHOTO_REF_URL } from "../../service/GlobalApi";
import { SpinnerImage } from "@/components/ui/spinner";

function HotelCard({ day, index, daysCount }) {
	const [photoUrl, setPhotoUrl] = useState(null);
	const [imageLoading, setImageLoading] = useState(true);

	useEffect(() => {
		if (day?.accommodation?.location) {
			getPlaceImage();
		}
	}, [day]);

	const data = {
		textQuery: day?.accommodation?.location,
	};

	const getPlaceImage = async () => {
		setImageLoading(true);
		try {
			const res = await GetPlaceDetails(data);
			if (res?.data?.places?.[0]?.photos?.length) {
				const photoRef = res.data.places[0].photos[0].name;
				const url = PHOTO_REF_URL.replace("{NAME}", photoRef);
				setPhotoUrl(url);
			}
		} catch (err) {
			console.error("Error fetching place image:", err);
		} finally {
			setImageLoading(false);
		}
	};

	// Extract price and currency from notes
	const extractPriceAndCurrency = (notes) => {
		if (!notes) return { price: null, currency: null };
		// Match price patterns: Price: $150 per night, Price: ₹5000 per night, etc.
		const match = notes.match(/(?:Price|price):\s*([$₹€£¥]|USD|INR|EUR|GBP|JPY)?\s*(\d+(?:[.,]\d+)?)\s*per\s*night/i);
		if (match) {
			const symbol = match[1];
			const price = parseFloat(match[2].replace(/,/g, ''));
			const currencyMap = {
				'$': 'USD',
				'₹': 'INR',
				'€': 'EUR',
				'£': 'GBP',
				'¥': 'JPY',
			};
			const currency = symbol && currencyMap[symbol] 
				? currencyMap[symbol]
				: (symbol && ['USD', 'INR', 'EUR', 'GBP', 'JPY'].includes(symbol.toUpperCase())
					? symbol.toUpperCase()
					: day?.accommodation?.currency || 'USD');
			return { price, currency };
		}
		// Fallback: try without "per night"
		const fallbackMatch = notes.match(/(?:Price|price):\s*([$₹€£¥]|USD|INR|EUR|GBP|JPY)?\s*(\d+(?:[.,]\d+)?)/i);
		if (fallbackMatch) {
			const symbol = fallbackMatch[1];
			const price = parseFloat(fallbackMatch[2].replace(/,/g, ''));
			const currencyMap = {
				'$': 'USD',
				'₹': 'INR',
				'€': 'EUR',
				'£': 'GBP',
				'¥': 'JPY',
			};
			const currency = symbol && currencyMap[symbol] 
				? currencyMap[symbol]
				: (symbol && ['USD', 'INR', 'EUR', 'GBP', 'JPY'].includes(symbol.toUpperCase())
					? symbol.toUpperCase()
					: day?.accommodation?.currency || 'USD');
			return { price, currency };
		}
		// Fallback to accommodation object if available
		if (day?.accommodation?.pricePerNight) {
			return {
				price: day.accommodation.pricePerNight,
				currency: day.accommodation.currency || 'USD'
			};
		}
		return { price: null, currency: null };
	};

	// Extract amenities from notes
	const extractAmenities = (notes) => {
		if (!notes) return [];
		// Look for "Amenities:" pattern in notes
		const amenitiesMatch = notes.match(/(?:Amenities|amenities):\s*([^.]+)/i);
		if (amenitiesMatch) {
			// Split by comma and clean up
			const amenitiesList = amenitiesMatch[1]
				.split(',')
				.map(a => a.trim())
				.filter(a => a.length > 0);
			return amenitiesList;
		}
		// Fallback: Look for common amenity keywords
		const amenityKeywords = ['WiFi', 'WIFI', 'Pool', 'SPA', 'Gym', 'Fitness', 'Restaurant', 'Parking', 'AC', 'Air Conditioning', 'Room Service', 'Bar', 'Lounge', 'Swimming Pool', 'Fitness Center', 'Business Center'];
		const found = amenityKeywords.filter(keyword => 
			notes.toLowerCase().includes(keyword.toLowerCase())
		);
		return found;
	};

	const { price, currency } = extractPriceAndCurrency(day?.accommodation?.notes);
	const amenities = extractAmenities(day?.accommodation?.notes);
	const maxVisibleAmenities = 1;
	const visibleAmenities = amenities.slice(0, maxVisibleAmenities);
	const remainingCount = amenities.length - maxVisibleAmenities;
	const [showTooltip, setShowTooltip] = useState(false);

	// Currency symbol map
	const currencySymbols = {
		USD: '$',
		INR: '₹',
		EUR: '€',
		GBP: '£',
		JPY: '¥',
	};
	const currencySymbol = currency ? (currencySymbols[currency] || currency) : '';

	// Extract star rating from notes or accommodation
	const extractStarRating = () => {
		const notes = day?.accommodation?.notes || '';
		// Look for "Rating: X star hotel" pattern
		const ratingMatch = notes.match(/(?:Rating|rating):\s*(\d+)\s*star/i);
		if (ratingMatch) return parseInt(ratingMatch[1]);
		// Fallback: look for just "X star" pattern
		const fallbackMatch = notes.match(/(\d+)\s*star/i);
		if (fallbackMatch) return parseInt(fallbackMatch[1]);
		// Check if rating is in accommodation object
		if (day?.accommodation?.rating) return day.accommodation.rating;
		return null;
	};

	const starRating = extractStarRating();

	return (
		<Link
			to={`https://www.google.com/maps/search/?api=1&query=${day?.accommodation?.name}, ${day?.accommodation?.location}`}
			target="_blank"
			rel="noopener noreferrer"
			className="h-full flex"
		>
			<div
				key={index}
				className="bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 transition-all hover:-translate-y-2 overflow-hidden cursor-pointer group flex-1 flex flex-col"
			>
				{/* Hotel Image with Overlay */}
				<div className="relative overflow-hidden h-48">
					{imageLoading && <SpinnerImage />}
					<img
						src={photoUrl || "/placeholder.jpg"}
						alt={day?.accommodation?.name}
						className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
						onLoad={() => setImageLoading(false)}
						onError={() => setImageLoading(false)}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
					
					{/* Day Badge - Top Right */}
					<div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
						{daysCount > 1 ? `${daysCount} Days` : `Day ${index + 1}`}
					</div>
					
					{/* Day of Week - Bottom Left */}
					<div className="absolute bottom-3 left-3">
						<p className="text-white font-bold text-sm drop-shadow-lg bg-black/30 px-2 py-1 rounded-md">
							{day?.day_of_week}
						</p>
					</div>
				</div>

				{/* Hotel Details */}
				<div className="p-5 flex flex-col flex-1 relative bg-gradient-to-b from-white to-gray-50">
					{/* Hotel Name and Star Rating */}
					<div className="mb-3">
						<div className="flex items-start justify-between gap-2 mb-2">
							<h3 
								className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1"
								title={day?.accommodation?.name}
							>
								{day?.accommodation?.name}
							</h3>
							{/* Star Rating */}
							{starRating && (
								<div className="flex items-center gap-0.5 flex-shrink-0">
									{Array.from({ length: 5 }).map((_, i) => (
										<svg
											key={i}
											className={`w-4 h-4 ${i < starRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
											viewBox="0 0 20 20"
										>
											<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
										</svg>
									))}
								</div>
							)}
						</div>
						
						{/* Location with Pin Icon */}
						<div className="flex items-start gap-2">
							<span className="text-blue-600 flex-shrink-0 mt-0.5">📍</span>
							<p 
								className="text-sm text-gray-600 line-clamp-2 leading-relaxed"
								title={day?.accommodation?.location}
							>
								{day?.accommodation?.location}
							</p>
						</div>
					</div>
					
					{/* Amenities Chips */}
					{amenities.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-4 relative">
							{visibleAmenities.map((amenity, idx) => (
								<span
									key={idx}
									className="text-xs px-3 py-1 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 rounded-full font-medium border border-cyan-200 shadow-sm"
								>
									{amenity}
								</span>
							))}
							{remainingCount > 0 && (
								<div 
									className="relative"
									onMouseEnter={() => setShowTooltip(true)}
									onMouseLeave={() => setShowTooltip(false)}
								>
									<span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
										+{remainingCount}
									</span>
									{/* Tooltip */}
									{showTooltip && (
										<div className="absolute bottom-full left-0 mb-2 z-50 bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-3 min-w-[200px] max-w-[300px]">
											<div className="font-semibold mb-2 text-white">All Amenities:</div>
											<div className="flex flex-wrap gap-1.5">
												{amenities.slice(1).map((amenity, idx) => (
													<span
														key={idx}
														className="px-2 py-1 bg-gray-800 text-gray-100 rounded-md text-[10px]"
													>
														{amenity}
													</span>
												))}
											</div>
											{/* Tooltip Arrow */}
											<div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
										</div>
									)}
								</div>
							)}
						</div>
					)}

					{/* Price Per Night Badge - Bottom Right */}
					{price && (
						<div className="absolute bottom-5 right-5 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-lg shadow-xl">
							<div className="text-[9px] font-semibold opacity-90 uppercase tracking-wide mb-0.5">
								Per Night
							</div>
							<div className="text-sm font-extrabold leading-tight">
								{currencySymbol}{price.toLocaleString()}
							</div>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

export default HotelCard;
