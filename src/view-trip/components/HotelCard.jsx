import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPlaceDetails, PHOTO_REF_URL } from "../../service/GlobalApi";

function HotelCard({ day, index }) {
	const [photoUrl, setPhotoUrl] = useState(null);

	useEffect(() => {
		if (day?.accommodation?.location) {
			getPlaceImage();
		}
	}, [day]);

	const data = {
		textQuery: day?.accommodation?.location,
	};

	const getPlaceImage = async () => {
		try {
			const res = await GetPlaceDetails(data);
			if (res?.data?.places?.[0]?.photos?.length) {
				const photoRef = res.data.places[0].photos[0].name;
				const url = PHOTO_REF_URL.replace("{NAME}", photoRef);
				setPhotoUrl(url);
			}
		} catch (err) {
			console.error("Error fetching place image:", err);
		}
	};

	return (
		<Link
			to={`https://www.google.com/maps/search/?api=1&query=${day?.accommodation?.name}, ${day?.accommodation?.location}`}
			target="_blank"
			rel="noopener noreferrer"
			className="h-full flex"
		>
			<div
				key={index}
				className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border-2 border-blue-200/50 transition-all hover:-translate-y-1 overflow-hidden cursor-pointer group flex-1 flex flex-col"
			>
				{/* Hotel Image with Overlay */}
				<div className="relative overflow-hidden">
					<img
						src={photoUrl || "/placeholder.jpg"}
						alt={day?.accommodation?.name}
						className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
					
					{/* Day Badge */}
					<div className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
						Day {index + 1}
					</div>
					
					{/* Day of Week */}
					<div className="absolute bottom-2 left-2">
						<p className="text-white font-bold text-base drop-shadow-lg">{day?.day_of_week}</p>
					</div>
				</div>

				{/* Hotel Details */}
				<div className="p-4 flex flex-col flex-1">
					<h3 
						className="font-bold text-base text-gray-800 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors"
						title={day?.accommodation?.name}
					>
						{day?.accommodation?.name}
					</h3>
					<p 
						className="text-xs text-gray-600 flex items-center gap-1.5 mb-2"
						title={day?.accommodation?.location}
					>
						<span className="text-blue-600 flex-shrink-0">📍</span>
						<span className="line-clamp-1">{day?.accommodation?.location}</span>
					</p>
					{day?.accommodation?.notes && (
						<p 
							className="text-xs text-gray-500 line-clamp-2 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 mt-auto"
							title={day.accommodation.notes}
						>
							{day.accommodation.notes}
						</p>
					)}
				</div>
			</div>
		</Link>
	);
}

export default HotelCard;
