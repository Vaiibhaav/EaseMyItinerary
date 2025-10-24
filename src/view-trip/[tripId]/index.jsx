import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Activities from "../components/Activities";
import Notes from "../components/Notes";
import ExpensesBreakdown from "../components/ExpensesBreakdown";
import ShareButton from "../components/ShareButton";
import { Button } from "@/components/ui/button";
import { GoogleGenAI } from "@google/genai";
import handleRegenerateTrip from "../../service/handleRegenerateTrip";


const ai = new GoogleGenAI({
	apiKey: import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY,
});

function ViewTrip() {
	const { tripId } = useParams();
	const [trip, setTrip] = useState(null);
	const [updatePrompt, setUpdatePrompt] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (tripId) getTripData();
	}, [tripId]);

	const getTripData = async () => {
		try {
			const docRef = doc(db, "AiTrips", tripId);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				setTrip(docSnap.data());
			} else {
				console.log("No Such Data");
			}
		} catch (err) {
			console.error("Error fetching trip data:", err);
		}
	};

	// -----------------------------
	// AI Update Function
	// -----------------------------
	const handleRegenerateTripClick = async () => {
		if (!updatePrompt.trim() || !trip) return;
		setLoading(true);

		try {
			const updatedTripData = await handleRegenerateTrip(
				trip.tripData,
				updatePrompt
			);

			// Update UI
			setTrip((prev) => ({
				...prev,
				tripData: updatedTripData,
			}));

			// Save updated itinerary to Firestore
			await setDoc(doc(db, "AiTrips", tripId), {
				...trip,
				tripData: updatedTripData,
				updatedAt: new Date().toISOString(),
			});

			alert("✅ Trip itinerary updated successfully!");
			setUpdatePrompt("");
		} catch (err) {
			console.error("Error regenerating trip:", err);
			alert("Failed to regenerate itinerary. Please refine your request.");
		} finally {
			setLoading(false);
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

					{/* Input box for regeneration */}
					<div className="space-y-4">
						<textarea
							value={updatePrompt}
							onChange={(e) => setUpdatePrompt(e.target.value)}
							placeholder="Describe the changes you'd like (e.g., Make it 3 days, add beaches, increase budget...)"
							className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary resize-none"
							rows={3}
						/>
						<Button
							onClick={handleRegenerateTripClick}
							disabled={loading}
							className="w-full rounded-full text-lg"
						>
							{loading ? "Regenerating..." : "Regenerate Itinerary"}
						</Button>
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
	