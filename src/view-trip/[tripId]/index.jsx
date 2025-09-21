import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Activities from "../components/Activities";
import Notes from "../components/Notes";
import ExpensesBreakdown from "../components/ExpensesBreakdown";
import ShareButton from "../components/ShareButton";
import { Button } from "@/components/ui/button";

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
			setTrip(docSnap.data());
		} else {
			console.log("No Such Data");
		}
	};

	if (!trip)
		return (
			<div className="p-10 text-center text-muted-foreground">
				Loading trip details...
			</div>
		);

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

	return (
		<div className="p-6 md:px-12 lg:px-20 xl:px-32">
			{/* Header */}
			<div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
				<h1 className="text-3xl font-extrabold text-primary">
					{trip?.tripData?.destination || "Trip Details"}
				</h1>
			</div>

			{/* Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
				{/* Left: Main Trip Details */}
				<div className="lg:col-span-2 space-y-10">
					<InfoSection trip={trip} />
					<ShareButton
						tripId={tripId}
						destination={trip?.tripData?.destination}
					/>
					<Hotels trip={trip} />
					<Activities trip={trip} />
					<ExpensesBreakdown trip={trip} />
					<Notes trip={trip} />
					<div className="space-y-4">
						<input
							type="text"
							placeholder="Enter any changes you'd like..."
							className="w-full rounded-md border px-3 py-2"
						/>
						<Button className="w-full rounded-full">Book Now</Button>
					</div>
				</div>

				{/* Right: Recommended Trips */}
				<aside className="space-y-6">
					<h2 className="text-xl font-bold text-foreground">
						Similar Recommended Trips
					</h2>
					<div className="space-y-6">
						{recommendedTrips.map((r) => (
							<div
								key={r.id}
								className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition"
							>
								<img
									src={r.image}
									alt={r.destination}
									className="w-full h-32 object-cover"
								/>
								<div className="p-4">
									<h3 className="font-semibold text-lg text-foreground">
										{r.destination}
									</h3>
									<p className="text-sm text-muted-foreground mb-1">
										{r.days} days itinerary
									</p>
									<p className="text-sm text-foreground/80">{r.description}</p>
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
