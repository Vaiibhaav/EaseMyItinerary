import React from "react";
import ActivitiesCard from "./ActivitiesCard";

function Activities({ trip }) {
	return (
		<div className="space-y-10">
			{/* Section Heading */}
			<div className="flex items-center gap-2 mb-4">
				<h2 className="text-2xl font-extrabold text-primary">
					Daily Activities
				</h2>
				<div className="flex-grow border-t border-border"></div>
			</div>

			{trip?.tripData?.daily_itinerary?.map((day, index) => (
				<div key={index} className="space-y-6">
					{/* Day Heading */}
					<h3 className="font-semibold text-lg text-foreground bg-accent/40 px-4 py-2 rounded-lg inline-block">
						Day {index + 1} — {day?.day_of_week}{" "}
						{day?.theme_focus && (
							<span className="text-primary font-medium">
								({day.theme_focus})
							</span>
						)}
					</h3>

					{/* Activities Grid */}
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
