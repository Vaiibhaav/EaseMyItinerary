import React from "react";
import { Button } from "../button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ⭐ Simple star rating sub-component
function Stars({ count }) {
	return (
		<div className="flex justify-center">
			{Array.from({ length: 5 }).map((_, i) => (
				<span
					key={i}
					className={
						i < count ? "text-yellow-400 text-lg" : "text-gray-300 text-lg"
					}
				>
					★
				</span>
			))}
		</div>
	);
}

function Landing() {
	const { t } = useTranslation();

	// Demo reviews with Indian users + itinerary images
	const demoReviews = [
		{
			name: "Amit Sharma",
			image: "/demo-users/amit.jpg", // place images in public/demo-users/
			review:
				"EaseMyItinerary planned my Goa trip perfectly! Smooth bookings and the best nightlife spots.",
			rating: 5,
			itinerary: "3 Days in Goa",
			itineraryImg: "/demo-itineraries/goa.jpg",
			highlights: ["Baga Beach", "Calangute Nightlife", "Seafood Shacks"],
		},
		{
			name: "Priya Verma",
			image: "/demo-users/priya.jpg",
			review:
				"Booked my honeymoon to Kerala. The AI suggested serene houseboats and tea gardens — unforgettable! ❤️",
			rating: 5,
			itinerary: "7 Days in Kerala",
			itineraryImg: "/demo-itineraries/kerala.jpg",
			highlights: [
				"Alleppey Houseboat",
				"Munnar Tea Gardens",
				"Kathakali Show",
			],
		},
		{
			name: "Sulochana",
			image: "/demo-users/sulochana.jpg",
			review:
				"Quick, easy, and budget-friendly! Jaipur was vibrant, and I loved the fort visits.",
			rating: 4,
			itinerary: "2 Days in Jaipur",
			itineraryImg: "/demo-itineraries/jaipur.jpg",
			highlights: ["Amber Fort", "Hawa Mahal", "Local Bazaars"],
		},
	];

	return (
		<div className="flex flex-col items-center mx-6 md:mx-56 gap-12">
			{/* Hero Section */}
			<h1 className="font-extrabold text-[36px] md:text-[50px] text-center mt-16 leading-tight">
				<span className="text-[#f56551]">{t("AI-Powered Itineraries")} </span>
				{t("— Tailored,Bookable, Instant.")}
			</h1>
			<p className="text-lg md:text-xl text-gray-500 text-center max-w-3xl">
				{t(
					"Generate end-to-end, optimized itineraries based on budget, time, and interests — adapt in real time and book everything with one click."
				)}
			</p>
			<Link to={"/create-trip"}>
				<Button className="px-6 py-3 text-lg rounded-full">
					{t("Get Started")}
				</Button>
			</Link>

			{/* Experiences Section */}
			<section className="w-full max-w-6xl mt-20 mb-20">
				<h2 className="text-3xl font-bold text-center mb-12">
					Traveller Experiences ✨
				</h2>
				<div className="grid md:grid-cols-3 gap-10">
					{demoReviews.map((r, idx) => (
						<div
							key={idx}
							className="bg-white shadow-lg rounded-2xl overflow-hidden border hover:shadow-2xl transition flex flex-col"
						>
							{/* Itinerary image */}
							<img
								src={r.itineraryImg}
								alt={r.itinerary}
								className="w-full h-40 object-cover"
							/>

							<div className="p-6 flex-1 flex flex-col">
								{/* User details */}
								<div className="flex items-center gap-3 mb-4">
									<img
										src={r.image}
										alt={r.name}
										className="w-12 h-12 rounded-full object-cover border"
									/>
									<div>
										<h3 className="font-semibold text-lg">{r.name}</h3>
										<Stars count={r.rating} />
									</div>
								</div>

								{/* Review */}
								<p className="text-gray-600 text-sm flex-1">{r.review}</p>

								{/* Highlights */}
								<div className="mt-4">
									<h4 className="text-xs font-bold uppercase text-gray-500 mb-1">
										Highlights
									</h4>
									<ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
										{r.highlights.map((h, i) => (
											<li key={i}>{h}</li>
										))}
									</ul>
								</div>

								{/* Itinerary tag */}
								<div className="mt-4 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full w-fit">
									{r.itinerary}
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

export default Landing;
