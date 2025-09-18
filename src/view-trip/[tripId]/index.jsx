import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Activities from "../components/Activities";
import Notes from "../components/Notes";
import { Button } from "@/components/ui/button"; // ✅ using your Button

function ViewTrip() {
	const { tripId } = useParams();
	const [trip, setTrip] = useState(null);

	useEffect(() => {
		tripId && getTripData();
	}, [tripId]);

	const getTripData = async () => {
		const docRef = doc(db, "AiTrips", tripId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			console.log("Document:", docSnap.data());
			setTrip(docSnap.data());
		} else {
			console.log("No Such Data");
		}
	};

	if (!trip) return <div className="p-10">Loading trip details...</div>;

	// Demo recommended trips
	const recommendedTrips = [
		{
			id: "goa123",
			destination: "Goa",
			days: 3,
			image: "/demo-itineraries/goa.jpg",
			description: "Beach vibes, nightlife & seafood.",
		},
		{
			id: "kerala456",
			destination: "Kerala",
			days: 7,
			image: "/demo-itineraries/kerala.jpg",
			description: "Houseboats, backwaters & tea gardens.",
		},
		{
			id: "jaipur789",
			destination: "Jaipur",
			days: 2,
			image: "/demo-itineraries/jaipur.jpg",
			description: "Forts, palaces & vibrant bazaars.",
		},
	];

	// ✅ Share Trip Handler
	const handleShare = () => {
		const shareUrl = `${window.location.origin}/view-trip/${tripId}`;
		const shareData = {
			title: `Trip to ${trip?.tripData?.destination || "Destination"}`,
			text: "Check out this amazing trip itinerary I created!",
			url: shareUrl,
		};

		if (navigator.share) {
			navigator
				.share(shareData)
				.then(() => console.log("Trip shared successfully"))
				.catch((err) => console.error("Error sharing trip:", err));
		} else {
			navigator.clipboard.writeText(shareUrl);
			alert("Link copied to clipboard!");
		}
	};

	return (
		<div className="p-6 md:px-12 lg:px-20 xl:px-32">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">
					{trip?.tripData?.destination || "Trip Details"}
				</h1>
				<Button onClick={handleShare}>Share Trip</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
				{/* Left: Main Trip Details */}
				<div className="lg:col-span-2 space-y-10">
					<InfoSection trip={trip} />
					<Hotels trip={trip} />
					<Activities trip={trip} />
					<Notes trip={trip} />
				</div>

				{/* Right: Recommended Trips */}
				<aside className="space-y-6">
					<h2 className="text-xl font-bold mb-3">Similar Recommended Trips</h2>
					<div className="space-y-6">
						{recommendedTrips.map((r) => (
							<div
								key={r.id}
								className="bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition"
							>
								<img
									src={r.image}
									alt={r.destination}
									className="w-full h-32 object-cover"
								/>
								<div className="p-4">
									<h3 className="font-semibold text-lg">{r.destination}</h3>
									<p className="text-sm text-gray-500 mb-2">
										{r.days} days itinerary
									</p>
									<p className="text-sm text-gray-600">{r.description}</p>
								</div>
							</div>
						))}
					</div>
				</aside>
			</div>
		</div>
	);
}

export default ViewTrip;
