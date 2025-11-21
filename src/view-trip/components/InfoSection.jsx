import React, { useEffect, useState } from "react";
import { Calendar, Users, Wallet } from "lucide-react"; // ✅ Lucide icons
import { GetPlaceDetails, PHOTO_REF_URL } from "../../service/GlobalApi";

function InfoSection({ trip }) {
	const [photoUrl, setPhotoUrl] = useState();

	useEffect(() => {
		trip && getPlaceImage();
	}, [trip]);

	const data = {
		textQuery: trip?.userSelection?.destination?.label || trip.tripData?.destination,
	};

	const getPlaceImage = async () => {
		try {
			const res = await GetPlaceDetails(data);
			if (res?.data?.places?.[0]?.photos?.[3]) {
				const photoUrl = PHOTO_REF_URL.replace(
					"{NAME}",
					res.data.places[0].photos[3].name
				);
				setPhotoUrl(photoUrl);
			}
		} catch (err) {
			console.error("Error fetching cover image:", err);
		}
	};

	return (
		<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-cyan-200/50 overflow-hidden">
			{/* Cover Image with Gradient Overlay */}
			<div className="relative">
				<img
					src={photoUrl || "/placeholder.jpg"}
					className="h-[280px] w-full object-cover"
					alt="Trip cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
				
				{/* Destination Title on Image */}
				<div className="absolute bottom-4 left-4 right-4">
					<h2 className="font-extrabold text-3xl md:text-4xl text-white drop-shadow-2xl">
						{trip?.userSelection?.destination?.label || trip.tripData?.destination}
					</h2>
				</div>
			</div>

			{/* Trip Details */}
			<div className="p-5">
				<div className="flex flex-wrap gap-3">
					<div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-lg border border-blue-200">
						<Calendar className="w-5 h-5 text-blue-600" />
						<div>
							<p className="text-xs text-blue-600 font-semibold">Duration</p>
							<p className="text-blue-800 font-bold text-sm">
								{trip?.userSelection?.days} {trip?.userSelection?.days > 1 ? 'Days' : 'Day'}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 rounded-lg border border-green-200">
						<Wallet className="w-5 h-5 text-green-600" />
						<div>
							<p className="text-xs text-green-600 font-semibold">Budget</p>
							<p className="text-green-800 font-bold text-sm">
								₹{parseInt(trip?.userSelection?.budget).toLocaleString('en-IN')}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 px-4 py-2.5 bg-cyan-50 rounded-lg border border-cyan-200">
						<Users className="w-5 h-5 text-cyan-600" />
						<div>
							<p className="text-xs text-cyan-600 font-semibold">Travelers</p>
							<p className="text-cyan-800 font-bold text-sm">
								{trip?.userSelection?.people} {trip?.userSelection?.people > 1 ? 'People' : 'Person'}
							</p>
						</div>
					</div>

					{/* Themes inline */}
					{trip?.userSelection?.themes && trip.userSelection.themes.length > 0 && (
						trip.userSelection.themes.slice(0, 3).map((theme, idx) => (
							<span 
								key={idx}
								className="flex items-center text-xs font-semibold text-cyan-700 bg-cyan-50 px-3 py-2.5 rounded-lg border border-cyan-200"
							>
								{theme}
							</span>
						))
					)}
				</div>
			</div>
		</div>
	);
}

export default InfoSection;
