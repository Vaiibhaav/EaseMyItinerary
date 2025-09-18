import React, { useEffect, useState } from "react";
import { GetPlaceDetails, PHOTO_REF_URL } from "../../service/GlobalApi";
import { Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UserTripCardItem({ trip }) {
	const [photoUrl, setPhotoUrl] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (trip?.userSelection?.destination?.label) {
			getPlaceImage();
		}
	}, [trip]);

	const getPlaceImage = async () => {
		try {
			const data = { textQuery: trip.userSelection.destination.label };
			const res = await GetPlaceDetails(data);
			if (res?.data?.places?.[0]?.photos?.length) {
				const photoRef = res.data.places[0].photos[0].name;
				const url = PHOTO_REF_URL.replace("{NAME}", photoRef);
				setPhotoUrl(url);
			}
		} catch (err) {
			console.error("Error fetching trip image:", err);
		}
	};

	const handleViewDetails = () => {
	    navigate(`/view-trip/${trip.id}`);
	};



	return (
		<div className="group relative rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col">
			{/* Image */}
			<div className="relative">
				<img
					src={photoUrl || "/placeholder.jpg"}
					alt={trip?.userSelection?.destination?.label}
					className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
				/>
				<div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
			</div>

			{/* Content */}
			<div className="p-4 flex flex-col flex-grow">
				<h3 className="font-semibold text-xl text-gray-800 line-clamp-1">
					{trip?.userSelection?.destination?.label}
				</h3>

				<div className="mt-2 flex items-center text-gray-600 text-sm gap-4">
					<span className="flex items-center gap-1">
						<Calendar className="w-4 h-4" />
						{trip?.userSelection?.days} days
					</span>
					<span className="flex items-center gap-1">
						<Users className="w-4 h-4" />
						{trip?.userSelection?.people} people
					</span>
				</div>

				<p className="mt-3 text-sm text-gray-500 line-clamp-2">
					{trip?.tripData?.notes || " "}
				</p>

				{/* CTA button */}
				<button
					onClick={handleViewDetails}
					className="mt-4 w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
				>
					View Details
				</button>
			</div>
		</div>
	);
}

export default UserTripCardItem;
