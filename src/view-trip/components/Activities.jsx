// Activities.jsx (FINAL FIXED VERSION)
// - Adds support for mapData
// - Falls back to raw dayLocations if mapData unavailable
// - NO UI changes
// - No string hacks
// - Supports any city

import React from "react";
import ActivitiesCard from "./ActivitiesCard";

function Activities({ trip, mapData, onOpenMap, onOpenStepMap }) {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
					🎯 Activities
				</h2>
				<div className="flex-grow border-t-2 border-cyan-200"></div>
			</div>

			{trip?.tripData?.daily_itinerary?.map((day, index) => {
				// Extract clean, verified locations from itinerary (fallback)
				const rawLocations = [
					day?.accommodation?.location,
					...(day.activities || [])
						.filter((a) => a.location)
						.map((a) => a.location),
				].filter(Boolean);

				const dayLocations = rawLocations.map((loc) => String(loc).trim());

				// Use mapData if available, else fallback to dayLocations
				const finalLocations =
					mapData?.day_locations?.[index]?.all_locations || dayLocations;

				return (
					<div
						key={index}
						className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-cyan-200/50 p-5"
					>
						<div className="flex items-center mb-4 pb-3 border-b-2 border-blue-100">
							<div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm">
								Day {index + 1}
							</div>

							<h3 className="font-bold text-lg text-gray-800 ml-3">
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
							{day.activities?.map((activity, idx) => {
								let prevLoc = null;
								let thisLoc = null;

								if (idx > 0) {
									const prev = day.activities[idx - 1]?.location;
									const curr = activity.location;

									prevLoc = prev?.trim() || null;
									thisLoc = curr?.trim() || null;
								}

								return (
									<div className="relative" key={idx}>
										<ActivitiesCard activity={activity} />

										{idx > 0 && prevLoc && thisLoc && (
											<button
												onClick={() => onOpenStepMap(prevLoc, thisLoc)}
												className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow hover:bg-blue-600 transition"
												title="View route from previous activity"
											>
												🗺️
											</button>
										)}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default Activities;
