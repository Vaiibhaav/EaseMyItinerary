import React from "react";
import HotelCard from "./HotelCard";

function Hotels({ trip }) {
	return (
		<div className="space-y-6">
			{/* Section Heading */}
			<div className="flex items-center gap-2">
				<h2 className="text-2xl font-extrabold text-primary">
					Hotel Recommendations
				</h2>
				<div className="flex-grow border-t border-border"></div>
			</div>

			{/* Grid layout for hotel cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{trip?.tripData?.daily_itinerary?.map((day, index) => (
					<HotelCard key={index} day={day} index={index} />
				))}
			</div>
		</div>
	);
}

export default Hotels;
