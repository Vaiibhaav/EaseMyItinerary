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
			className="h-full flex"
		>
			<div className="rounded-xl bg-gradient-to-br from-white to-cyan-50 shadow-md hover:shadow-lg border border-cyan-200/50 transition-all hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col flex-1 group">
				{/* Image with Overlay */}
				<div className="relative overflow-hidden">
					<img
						src={photoUrl || "/placeholder.jpg"}
						alt={activity?.description}
						className="w-full h-28 object-cover group-hover:scale-110 transition-transform duration-500"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
					
					{/* Time Badge */}
					<div className="absolute bottom-1.5 right-1.5 bg-white/90 backdrop-blur-sm text-cyan-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
						{activity?.time}
					</div>
				</div>

				{/* Content */}
				<div className="p-3 flex flex-col flex-1">
					{/* Description */}
					<h4 
						className="font-bold text-gray-800 text-xs mb-1.5 line-clamp-2 group-hover:text-cyan-600 transition-colors"
						title={activity?.description}
					>
						{activity?.description}
					</h4>

					{/* Location */}
					<p 
						className="text-gray-600 text-xs flex items-center gap-1 mt-auto"
						title={activity?.location}
					>
						<FaMapMarkerAlt className="text-cyan-500 text-xs flex-shrink-0" />
						<span className="line-clamp-1 text-xs">{activity?.location}</span>
					</p>
				</div>
			</div>
		</a>
	);
}

export default ActivitiesCard;
