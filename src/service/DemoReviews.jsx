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
		<div className="w-full bg-gradient-to-b from-blue-50 to-cyan-50 py-20">
			<section className="w-full max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
						Traveller Experiences
					</h2>
					<p className="text-gray-600 text-lg font-medium">
						See what our amazing travelers have to say
					</p>
				</div>
				<div className="grid md:grid-cols-3 gap-8">
					{demoReviews.map((r, idx) => (
						<div
							key={idx}
							className="bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden border-2 border-cyan-200/50 transition-all hover:-translate-y-2 hover:scale-105 flex flex-col group"
						>
							{/* Itinerary image with gradient overlay */}
							<div className="relative overflow-hidden">
								<img
									src={r.itineraryImg}
									alt={r.itinerary}
									className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
								/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
							<div className="absolute bottom-3 left-3 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1.5 rounded-full shadow-lg">
								{r.itinerary}
							</div>
							</div>

							<div className="p-6 flex-1 flex flex-col">
								{/* User details */}
								<div className="flex items-center gap-3 mb-4">
									<div className="relative">
										<img
											src={r.image}
											alt={r.name}
											className="w-14 h-14 rounded-full object-cover border-3 shadow-md ring-2 ring-cyan-200"
										/>
										<div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full p-1">
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path d="M9 12l-2-2-1.5 1.5L9 15l7-7-1.5-1.5L9 12z"/>
											</svg>
										</div>
									</div>
									<div>
										<h3 className="font-bold text-lg text-gray-800">
											{r.name}
										</h3>
										<Stars count={r.rating} />
									</div>
								</div>

								{/* Review */}
								<p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
									"{r.review}"
								</p>

								{/* Highlights */}
								<div className="mt-auto">
									<h4 className="text-xs font-bold uppercase bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 tracking-wide">
										✨ Highlights
									</h4>
									<div className="flex flex-wrap gap-2">
										{r.highlights.map((h, i) => (
											<span 
												key={i}
												className="text-xs font-semibold text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200"
											>
												{h}
											</span>
										))}
									</div>
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
