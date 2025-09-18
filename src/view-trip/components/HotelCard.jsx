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
			// ✅ FIX: use res.data instead of res
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
		>
			<div
				key={index}
				className="p-4 border rounded-lg shadow hover:scale-105 transition-all cursor-pointer"
			>
				<h3 className="font-semibold mb-2">
					Day {index + 1} - {day?.day_of_week}
				</h3>

				{/* Hotel Image */}
				<div className="mb-3">
					<img
						src={photoUrl || "/placeholder.jpg"}
						alt={day?.accommodation?.name}
						className="w-full h-40 object-cover rounded-xl"
					/>
				</div>

				{/* Hotel Details */}
				<p className="text-gray-700 font-medium">{day?.accommodation?.name}</p>
				<p className="text-gray-600 text-sm">
					📍 {day?.accommodation?.location}
				</p>
				<p className="text-sm text-gray-500 mt-2">
					{day?.accommodation?.notes}
				</p>
			</div>
		</Link>
	);
}

export default HotelCard;
