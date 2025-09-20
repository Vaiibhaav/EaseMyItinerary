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
		<div className="group relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
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
			<div className="p-5 flex flex-col flex-grow">
				{/* Destination Title */}
				<h3 className="font-bold text-xl text-foreground line-clamp-1">
					{trip?.userSelection?.destination?.label}
				</h3>

				{/* Meta Info */}
				<div className="mt-2 flex items-center text-sm text-muted-foreground gap-4">
					<span className="flex items-center gap-1">
						<Calendar className="w-4 h-4 text-primary/80" />
						{trip?.userSelection?.days} days
					</span>
					<span className="flex items-center gap-1">
						<Users className="w-4 h-4 text-primary/80" />
						{trip?.userSelection?.people} people
					</span>
				</div>

				{/* Notes */}
				<p className="mt-3 text-sm text-foreground/70 line-clamp-2">
					{trip?.tripData?.notes || "No additional notes provided."}
				</p>

				{/* CTA button */}
				<button
					onClick={handleViewDetails}
					className="mt-4 w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
				>
					View Details
				</button>
			</div>
		</div>
	);
}

export default UserTripCardItem;
