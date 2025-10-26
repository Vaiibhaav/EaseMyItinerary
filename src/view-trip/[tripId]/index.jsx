import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
	const navigate = useNavigate();
	const location = useLocation();
	const isPaid = location.state?.paid || false;

	useEffect(() => {
		if (tripId) getTripData();
	}, [tripId]);

	const getTripData = async () => {
		const docRef = doc(db, "AiTrips", tripId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) setTrip(docSnap.data());
		else console.log("No such data found");
	};

	if (!trip)
		return (
			<div className="p-10 text-center text-muted-foreground">
				Loading trip details...
			</div>
		);

	const itinerary = trip?.tripData?.daily_itinerary || [];
	const travelOptions = [];
	const stayOptions = [];

	itinerary.forEach((day) => {
		if (day?.budget_estimate_usd?.transport) {
			travelOptions.push({
				type: "Transport",
				name: `${day.date} Transport`,
				price: Math.round(day.budget_estimate_usd.transport * 85),
			});
		}
		if (day?.accommodation?.name) {
			stayOptions.push({
				type: "Accommodation",
				name: day.accommodation.name,
				price: Math.round(day.budget_estimate_usd.accommodation * 85 || 0),
			});
		}
	});

	const uniqueStayOptions = Object.values(
		stayOptions.reduce((acc, item) => {
			acc[item.name] = item;
			return acc;
		}, {})
	);

	const uniqueTravelOptions = Object.values(
		travelOptions.reduce((acc, item) => {
			acc[item.name] = item;
			return acc;
		}, {})
	);

	return (
		<div className="p-6 md:px-12 lg:px-20 xl:px-32">
			<div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
				<h1 className="text-3xl font-extrabold text-primary">
					{trip?.tripData?.destination || "Trip Details"}
				</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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

					{!isPaid ? (
						<>
							<div className="space-y-4">
								<input
									type="text"
									placeholder="Enter any changes you'd like..."
									className="w-full rounded-md border px-3 py-2"
								/>
								<Button className="w-full rounded-full cursor-pointer">
									Update Itinerary
								</Button>
							</div>

							<Button
								className="w-full rounded-full cursor-pointer"
								onClick={() => {
									const destination =
										trip?.tripData?.destination || "Unknown Destination";
									const travelOpts =
										uniqueTravelOptions.length > 0
											? uniqueTravelOptions
											: [
													{
														type: "Flight",
														name: "IndiGo Flight",
														price: 5500,
													},
													{ type: "Cab", name: "Ola Outstation", price: 2500 },
											  ];
									const stayOpts =
										uniqueStayOptions.length > 0
											? uniqueStayOptions
											: [
													{ type: "Hotel", name: "Marriott", price: 7000 },
													{ type: "Hostel", name: "Zostel", price: 1500 },
											  ];

									navigate("/booking", {
										state: {
											tripId,
											tripDetails: {
												destination,
												travelOptions: travelOpts,
												stayOptions: stayOpts,
											},
										},
									});
								}}
							>
								Book Now
							</Button>
						</>
					) : (
						<div className="p-4 bg-green-100 text-green-700 rounded-xl text-center font-medium mt-6">
							✅ Booking Confirmed! A receipt has been sent to your email.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default ViewTrip;
