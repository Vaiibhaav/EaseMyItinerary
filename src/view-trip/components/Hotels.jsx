import React from "react";
import HotelCard from "./HotelCard";

function Hotels({ trip }) {
	return (
		<div className="space-y-4">
			{/* Section Heading */}
			<div className="flex items-center gap-3">
				<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
					🏨 Hotels
				</h2>
				<div className="flex-grow border-t-2 border-cyan-200"></div>
			</div>

			{/* Grid layout for hotel cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 auto-rows-fr">
				{trip?.tripData?.daily_itinerary?.map((day, index) => (
					<HotelCard key={index} day={day} index={index} />
				))}
			</div>
		</div>
	);
}

export default Hotels;
