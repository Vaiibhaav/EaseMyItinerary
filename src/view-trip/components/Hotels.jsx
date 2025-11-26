import React, { useRef, useState, useEffect } from "react";
import HotelCard from "./HotelCard";
import HotelSelectionDialog from "./HotelSelectionDialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Hotels({ trip, onHotelUpdated }) {
	const [showHotelDialog, setShowHotelDialog] = useState(false);
	const scrollRef = useRef(null);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(true);
	const itinerary = trip?.tripData?.daily_itinerary || [];
	const accommodationPreference = trip?.userSelection?.accommodation || trip?.tripData?.accommodation_preference || "";

	// Determine section heading based on accommodation preference
	const getSectionHeading = () => {
		const pref = accommodationPreference.toLowerCase();
		if (pref.includes("hotel") || pref.includes("resort") || pref.includes("lodge")) {
			return "🏨 Hotels";
		} else if (pref.includes("hostel")) {
			return "🛏️ Hostels";
		} else if (pref.includes("apartment") || pref.includes("flat")) {
			return "🏠 Apartments";
		} else if (pref.includes("homestay") || pref.includes("home stay")) {
			return "🏡 Homestays";
		} else if (pref.includes("villa")) {
			return "🏛️ Villas";
		} else if (pref.includes("guesthouse") || pref.includes("guest house")) {
			return "🏘️ Guesthouses";
		} else {
			return "🏨 Accommodation";
		}
	};

	const checkScrollPosition = () => {
		if (scrollRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
			// Left arrow only shows when we've scrolled right (scrollLeft > 10 to account for small scrolls)
			setShowLeftArrow(scrollLeft > 10);
			// Right arrow shows when there's more content to scroll (with 10px threshold)
			setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
		}
	};

	useEffect(() => {
		const scrollContainer = scrollRef.current;
		if (scrollContainer) {
			// Initial check - wait for layout to calculate
			const timer = setTimeout(() => {
				checkScrollPosition();
			}, 100);
			
			scrollContainer.addEventListener('scroll', checkScrollPosition);
			// Also check on resize
			window.addEventListener('resize', checkScrollPosition);
			
			return () => {
				clearTimeout(timer);
				scrollContainer.removeEventListener('scroll', checkScrollPosition);
				window.removeEventListener('resize', checkScrollPosition);
			};
		}
	}, [itinerary]);

	const scrollLeft = () => {
		if (scrollRef.current) {
			const cardWidth = scrollRef.current.clientWidth / 2; // Approximate card width
			scrollRef.current.scrollBy({ left: -cardWidth - 20, behavior: 'smooth' });
		}
	};

	const scrollRight = () => {
		if (scrollRef.current) {
			const cardWidth = scrollRef.current.clientWidth / 2; // Approximate card width
			scrollRef.current.scrollBy({ left: cardWidth + 20, behavior: 'smooth' });
		}
	};

	if (itinerary.length === 0) {
		return null;
	}
	debugger
	const hasAvailableHotels = trip?.tripData?.availableHotels?.hotels?.length > 0;

	const handleHotelUpdated = async () => {
		if (onHotelUpdated) {
			onHotelUpdated();
		}
	};

	return (
		<div className="space-y-4 bg-transparent">
			{/* Section Heading */}
			<div className="flex items-center gap-3">
				<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
					{getSectionHeading()}
				</h2>
				<div className="flex-grow border-t-2 border-cyan-200"></div>
			</div>

			{/* Hotel Selection Option */}
			{hasAvailableHotels && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
					<p className="text-sm text-gray-700">
						<span className="font-medium">Not happy with the current hotel?</span>{" "}
						Click here to select a hotel from the list of available hotels.
					</p>
					<button
						onClick={() => setShowHotelDialog(true)}
						className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
					>
						Select Hotel
					</button>
				</div>
			)}

			{/* Horizontal Scrollable Container with Navigation */}
			<div className="relative bg-transparent">
				{/* Left Navigation Arrow */}
				{showLeftArrow && (
					<button
						onClick={scrollLeft}
						className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-full p-3 shadow-2xl hover:bg-white transition-all hover:scale-110 z-20 border-2 border-blue-200 hover:border-blue-400 group"
						aria-label="Scroll left"
					>
						<ChevronLeft className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
					</button>
				)}

				{/* Right Navigation Arrow */}
				{showRightArrow && (
					<button
						onClick={scrollRight}
						className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-full p-3 shadow-2xl hover:bg-white transition-all hover:scale-110 z-20 border-2 border-blue-200 hover:border-blue-400 group"
						aria-label="Scroll right"
					>
						<ChevronRight className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
					</button>
				)}

				{/* Horizontal Scrollable Container */}
				<div 
					ref={scrollRef}
					className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-1 bg-transparent"
					style={{
						scrollBehavior: 'smooth',
					}}
				>
					{itinerary.map((day, index) => (
						<div 
							key={index} 
							className="flex-shrink-0 w-full sm:w-[calc((100%-20px)/2)] snap-start"
						>
							<HotelCard day={day} index={index} />
						</div>
					))}
				</div>
			</div>

			{/* Hotel Selection Dialog */}
			<HotelSelectionDialog
				trip={trip}
				isOpen={showHotelDialog}
				onClose={() => setShowHotelDialog(false)}
				onHotelSelected={handleHotelUpdated}
			/>
		</div>
	);
}

export default Hotels;
