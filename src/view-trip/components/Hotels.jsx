import { Hotel } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import HotelCard from "./HotelCard";

function Hotels({ trip }) {
	return (
		<div>
			<h2 className="font-bold text-xl mt-5 mb-3">🏨 Hotel Recommendations</h2>

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
