import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../service/firebaseConfig";
import UserTripCardItem from "./components/UserTripCardItem";

function MyTrips() {
	const navigate = useNavigate();
	const [userTrips, setUserTrips] = useState([]);

	useEffect(() => {
		getUserTrips();
	}, []);

	const getUserTrips = async () => {
		const rawUser = localStorage.getItem("user");
		if (!rawUser) {
			navigate("/");
			return;
		}

		const user = JSON.parse(rawUser);
		setUserTrips([]);

		const q = query(
			collection(db, "AiTrips"),
			where("userEmail", "==", user.email)
		);

		const querySnapshot = await getDocs(q);
		const trips = [];
		querySnapshot.forEach((doc) => {
			trips.push({ id: doc.id, ...doc.data() });
		});

		// sort by ID (newest first)
		setUserTrips(trips.sort((a, b) => b.id - a.id));
	};

	return (
		<div className="flex flex-col items-center mt-12 px-6">
			{/* Header */}
			<div className="text-center mb-10">
				<h2 className="font-extrabold text-4xl text-primary mt-20">My Trips</h2>
				<p className="text-muted-foreground mt-2 max-w-xl">
					A collection of all the trips you’ve planned with{" "}
					<span className="font-semibold text-foreground">EaseMyItinerary</span>
					.
				</p>
			</div>

			{/* Trips Grid */}
			<div className="w-full max-w-6xl">
				{userTrips.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{userTrips.map((trip, index) => (
							<UserTripCardItem key={index} trip={trip} />
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl shadow-md">
						<img
							src="/empty-state.svg"
							alt="No trips"
							className="w-32 h-32 mb-4 opacity-70"
						/>
						<p className="text-muted-foreground text-lg">
							No trips found. Start by planning your first adventure!
						</p>
						<button
							onClick={() => navigate("/create-trip")}
							className="mt-6 px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition"
						>
							Create a Trip
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default MyTrips;
