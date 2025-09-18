import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { GetPlaceDetails, PHOTO_REF_URL } from "../../service/GlobalApi";

function ActivitiesCard({ activity }) {
	const [photoUrl, setPhotoUrl] = useState(null);

	useEffect(() => {
		if (activity?.location) {
			getActivityImage();
		}
	}, [activity]);

	const getActivityImage = async () => {
		try {
			const data = { textQuery: activity?.location };
			const res = await GetPlaceDetails(data);

			// ✅ FIX: axios returns data in res.data
			if (res?.data?.places?.[0]?.photos?.length) {
				const photoRef = res.data.places[0].photos[0].name;
				const url = PHOTO_REF_URL.replace("{NAME}", photoRef);
				setPhotoUrl(url);
			}
		} catch (err) {
			console.error("Error fetching activity image:", err);
		}
	};

	return (
		<a
			href={`https://www.google.com/maps/search/?api=1&query=${activity?.location}`}
			target="_blank"
			rel="noopener noreferrer"
			className="h-full"
		>
			<div className="p-4 border rounded-lg shadow hover:scale-105 transition-all cursor-pointer flex flex-col h-full">
				{/* Image */}
				<img
					src={photoUrl || "/placeholder.jpg"}
					alt={activity?.description}
					className="w-full h-28 object-cover rounded-md"
				/>

				{/* Description */}
				<h4 className="font-semibold text-gray-800 text-sm mt-2">
					{activity?.description}
				</h4>

				{/* Location */}
				<p className="text-gray-500 text-xs flex items-center gap-1">
					<FaMapMarkerAlt className="text-pink-500 text-xs" />
					{activity?.location}
				</p>

				{/* Time pinned bottom-left */}
				<p className="text-orange-600 font-bold text-sm mt-auto">
					{activity?.time}
				</p>
			</div>
		</a>
	);
}

export default ActivitiesCard;
