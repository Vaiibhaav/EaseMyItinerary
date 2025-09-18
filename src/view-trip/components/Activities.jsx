import React from "react";
import ActivitiesCard from "./ActivitiesCard";

function Activities({ trip }) {
	return (
		<div>
			<h2 className="font-bold text-xl mt-5 mb-3">🎯 Daily Activities</h2>

			{trip?.tripData?.daily_itinerary?.map((day, index) => (
				<div key={index} className="mb-10">
					{/* Day Heading */}
					<h3 className="font-semibold text-lg mb-4">
						Day {index + 1} - {day?.day_of_week} ({day?.theme_focus})
					</h3>

					{/* Responsive grid of compact cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
						{day?.activities?.map((activity, idx) => (
							<ActivitiesCard key={idx} activity={activity} />
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export default Activities;
