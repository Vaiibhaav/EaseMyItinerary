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
		>
			<div
				key={index}
				className="p-4 border border-border rounded-xl bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
			>
				{/* Day Heading */}
				<h3 className="font-semibold text-lg text-foreground mb-3">
					Day {index + 1} — {day?.day_of_week}
				</h3>

				{/* Hotel Image */}
				<div className="mb-3">
					<img
						src={photoUrl || "/placeholder.jpg"}
						alt={day?.accommodation?.name}
						className="w-full h-40 object-cover rounded-lg"
					/>
				</div>

				{/* Hotel Details */}
				<p className="text-foreground font-medium text-base">
					{day?.accommodation?.name}
				</p>
				<p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
					📍 {day?.accommodation?.location}
				</p>
				{day?.accommodation?.notes && (
					<p className="text-sm text-foreground/70 mt-2 line-clamp-2">
						{day.accommodation.notes}
					</p>
				)}
			</div>
		</Link>
	);
}

export default HotelCard;
