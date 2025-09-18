import React, { useEffect, useState } from "react";
import { IoIosShare } from "react-icons/io";
import { GetPlaceDetails, PHOTO_REF_URL } from "../../service/GlobalApi";

function InfoSection({ trip }) {


    const [photoUrl, setPhotoUrl] = useState(); 
    useEffect(() => {
        trip&&getPlaceImage();
    }, [trip]);
    const data = {
			textQuery: trip?.userSelection?.destination?.label
	};
    const getPlaceImage = async() => {
        const result = await GetPlaceDetails(data).then(res=>{
            console.log("Place Details:", res.data.places[0].photos[3].name);
            const photoUrl = PHOTO_REF_URL.replace("{NAME}", res.data.places[0].photos[3].name);
            setPhotoUrl(photoUrl);
        })
    }

	return (
		<div>
			<img
				src={photoUrl}
				className="h-[340px] w-full object-cover rounded"
				alt="Trip cover"
			/>

			<div className="flex justify-between items-start mt-5 mb-5">
				{/* Left: Trip Details */}
				<div className="flex flex-col gap-3">
					<h2 className="font-bold text-2xl">
						{trip?.userSelection?.destination?.label}
					</h2>

					<div className="flex flex-wrap gap-3">
						<span className="p-2 px-4 bg-gray-200 rounded-full text-gray-700 text-sm">
							🗓️{" "}
							{trip?.userSelection?.days > 1
								? `${trip?.userSelection?.days} Days Trip`
								: `${trip?.userSelection?.days} Day Trip`}
						</span>

						<span className="p-2 px-4 bg-gray-200 rounded-full text-gray-700 text-sm">
							💲 Maximum Budget: {trip?.userSelection?.budget} INR
						</span>

						<span className="p-2 px-4 bg-gray-200 rounded-full text-gray-700 text-sm">
							🧳 No. of Travelers:{" "}
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
