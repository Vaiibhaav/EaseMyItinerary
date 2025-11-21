import React from "react";
import ActivitiesCard from "./ActivitiesCard";

function Activities({ trip }) {
	return (
		<div className="space-y-6">
			{/* Section Heading */}
			<div className="flex items-center gap-3">
				<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
					🎯 Activities
				</h2>
				<div className="flex-grow border-t-2 border-cyan-200"></div>
			</div>

			{trip?.tripData?.daily_itinerary?.map((day, index) => (
				<div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-cyan-200/50 p-5">
					{/* Day Heading */}
					<div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-100">
						<div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm">
							Day {index + 1}
						</div>
						<h3 className="font-bold text-lg text-gray-800">
							{day?.day_of_week}
							{day?.theme_focus && (
								<span className="ml-2 text-cyan-600 text-sm font-medium">
									• {day.theme_focus}
								</span>
							)}
						</h3>
					</div>

					{/* Activities Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-fr">
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
