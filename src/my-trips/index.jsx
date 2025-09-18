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
			trips.push({ id: doc.id, ...doc.data() }); // include Firestore doc ID
		});
		setUserTrips(trips.sort((a, b) => b.id - a.id));
	};

	return (
		<div className="flex flex-col items-center mt-10 px-5">
			<h2 className="font-bold text-3xl mb-6">My Trips</h2>

			{/* Grid layout for trips */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
				{userTrips.length > 0 ? (
					userTrips.map((trip, index) => (
						<UserTripCardItem key={index} trip={trip} />
					))
				) : (
					<p className="text-gray-500">No trips found.</p>
				)}
			</div>
		</div>
	);
}

export default MyTrips;
