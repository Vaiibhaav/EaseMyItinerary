import React, { useEffect, useState } from "react";
import { Calendar, Users, Wallet } from "lucide-react"; // ✅ Lucide icons
import { GetPlaceDetails, PHOTO_REF_URL } from "../../service/GlobalApi";

function InfoSection({ trip }) {
	const [photoUrl, setPhotoUrl] = useState();

	useEffect(() => {
		trip && getPlaceImage();
	}, [trip]);

	const data = {
		textQuery: trip?.userSelection?.destination?.label,
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
		<div>
			{/* Cover Image */}
			<img
				src={photoUrl || "/placeholder.jpg"}
				className="h-[340px] w-full object-cover rounded-xl"
				alt="Trip cover"
			/>

			{/* Trip details */}
			<div className="flex justify-between items-start mt-6 mb-5">
				<div className="flex flex-col gap-4">
					<h2 className="font-bold text-3xl text-foreground">
						{trip?.userSelection?.destination?.label}
					</h2>

					<div className="flex flex-wrap gap-3">
						<span className="flex items-center gap-2 px-4 py-2 bg-accent/40 rounded-full text-sm text-foreground font-medium">
							<Calendar className="w-4 h-4 text-primary" />
							{trip?.userSelection?.days > 1
								? `${trip?.userSelection?.days} Days Trip`
								: `${trip?.userSelection?.days} Day Trip`}
						</span>

						<span className="flex items-center gap-2 px-4 py-2 bg-accent/40 rounded-full text-sm text-foreground font-medium">
							<Wallet className="w-4 h-4 text-primary" />
							Budget: {trip?.userSelection?.budget} INR
						</span>

						<span className="flex items-center gap-2 px-4 py-2 bg-accent/40 rounded-full text-sm text-foreground font-medium">
							<Users className="w-4 h-4 text-primary" />
							{trip?.userSelection?.people > 1
								? `${trip?.userSelection?.people} People`
								: `${trip?.userSelection?.people} Person`}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default InfoSection;
