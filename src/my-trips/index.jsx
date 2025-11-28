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

	const handleTripDelete = (tripId) => {
		// Remove the trip from the local state
		setUserTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
	};

	return (
		<div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-cyan-50 py-20 px-6">
			{/* Animated Background Shapes */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
			</div>

			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h2 className="font-extrabold text-5xl md:text-6xl mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
						My Trips
					</h2>
					<p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
						A collection of all the amazing trips you've planned with{" "}
						<span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
							EaseMyItinerary
						</span>
					</p>
				</div>

				{/* Trips Grid */}
				{userTrips.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{userTrips.map((trip, index) => (
							<UserTripCardItem key={index} trip={trip} onDelete={handleTripDelete} />
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-20 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-cyan-200/50">
						<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-6 mb-6">
							<svg className="w-20 h-20 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-800 mb-2">No Trips Yet</h3>
						<p className="text-gray-600 text-lg mb-8 text-center max-w-md">
							Start by planning your first adventure and create unforgettable memories!
						</p>
						<button
							onClick={() => navigate("/")}
							className="px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 transform hover:scale-105"
						>
							✨ Create Your First Trip
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default MyTrips;
