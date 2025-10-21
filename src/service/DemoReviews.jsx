import React from 'react'

function Stars({ count }) {
    return (
        <div className="flex justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
                <span
                    key={i}
                    className={
                        i < count
                            ? "text-yellow-400 text-lg"
                            : "text-muted-foreground/40 text-lg"
                    }
                >
                    ★
                </span>
            ))}
        </div>
    );
}
const DemoReviews = () => {
    const demoReviews = [
			{
				name: "Amit Sharma",
				image: "/demo-users/amit.jpg",
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
			<div>
				<section className="w-full max-w-6xl mt-20 mb-20">
					<h2 className="text-3xl font-bold text-center mt-10 mb-14 text-primary">
						Traveller Experiences
					</h2>
					<div className="grid md:grid-cols-3 gap-10">
						{demoReviews.map((r, idx) => (
							<div
								key={idx}
								className="bg-card shadow-sm hover:shadow-lg rounded-2xl overflow-hidden border border-border transition-transform hover:-translate-y-1 flex flex-col"
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
											className="w-12 h-12 rounded-full object-cover border-2 border-accent shadow-sm"
										/>
										<div>
											<h3 className="font-semibold text-lg text-foreground">
												{r.name}
											</h3>
											<Stars count={r.rating} />
										</div>
									</div>

									{/* Review */}
									<p className="text-muted-foreground text-sm italic leading-relaxed flex-1">
										“{r.review}”
									</p>

									{/* Highlights */}
									<div className="mt-4">
										<h4 className="text-xs font-bold uppercase text-muted-foreground mb-1 tracking-wide">
											Highlights
										</h4>
										<ul className="text-xs text-foreground list-disc list-inside space-y-1">
											{r.highlights.map((h, i) => (
												<li key={i}>{h}</li>
											))}
										</ul>
									</div>

									{/* Itinerary tag */}
									<div className="mt-4 text-xs font-medium text-primary bg-accent/40 px-3 py-1 rounded-full w-fit">
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

export default DemoReviews
