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
			<div className="p-4 border border-border rounded-xl bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full">
				{/* Image */}
				<img
					src={photoUrl || "/placeholder.jpg"}
					alt={activity?.description}
					className="w-full h-28 object-cover rounded-md"
				/>

				{/* Description */}
				<h4 className="font-semibold text-foreground text-sm mt-3 line-clamp-2">
					{activity?.description}
				</h4>

				{/* Location */}
				<p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
					<FaMapMarkerAlt className="text-primary text-xs" />
					{activity?.location}
				</p>

				{/* Time pinned at bottom */}
				<p className="text-primary font-medium text-sm mt-auto">
					{activity?.time}
				</p>
			</div>
		</a>
	);
}

export default ActivitiesCard;
