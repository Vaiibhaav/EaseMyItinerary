import React from "react";

function About() {
	return (
		<div className="flex flex-col items-center mx-6 md:mx-56 gap-14">
			{/* Background pattern like Landing */}
			<div className="absolute inset-0 -z-10">
				<img
					src="/travel-patternjpg.jpg"
					alt="Background pattern"
					className="w-full h-full object-cover opacity-10"
				/>
			</div>

			{/* Title */}
			<h1 className="font-extrabold text-4xl md:text-6xl text-center mt-20 leading-snug tracking-tight">
				<span className="text-primary/80">EaseMyItinerary</span>
				<br />
				<span className="text-muted-foreground font-medium text-2xl">
					AI-Powered Trip Planning, Simplified
				</span>
			</h1>

			{/* Intro paragraph */}
			<p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl leading-relaxed">
				EaseMyItinerary is your AI-powered travel companion. We help you
				discover destinations, generate optimized itineraries, and book
				experiences seamlessly — all in one place.
			</p>

			{/* Mission & Vision Section */}
			<section className="w-full max-w-6xl mt-10">
				<div className="grid md:grid-cols-2 gap-10">
					<div className="bg-card shadow-sm hover:shadow-lg rounded-2xl overflow-hidden border border-border p-8 transition-transform hover:-translate-y-1">
						<h2 className="text-2xl font-bold text-primary mb-3">
							Our Mission
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							We aim to remove the stress from trip planning by combining
							cutting-edge AI with local insights. Whether you’re a solo
							explorer or traveling with family, we help you make the most out
							of every journey.
						</p>
					</div>

					<div className="bg-card shadow-sm hover:shadow-lg rounded-2xl overflow-hidden border border-border p-8 transition-transform hover:-translate-y-1">
						<h2 className="text-2xl font-bold text-primary mb-3">
							Our Vision
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							To be the go-to travel assistant for millions worldwide —
							simplifying itineraries, saving time, and creating unforgettable
							memories through smarter travel planning.
						</p>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="w-full max-w-6xl mt-20 mb-20">
				<h2 className="text-3xl font-bold text-center mb-10 text-primary">
					What We Offer
				</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
					{[
						"AI-driven recommendations for destinations & activities",
						"Smart itinerary builder with real-time adjustments",
						"One-click bookings for flights, hotels & activities",
						"Collaboration tools for friends & family",
						"Cloud-synced data accessible across devices",
						"Localized India-first features (expandable globally)",
					].map((feature, idx) => (
						<div
							key={idx}
							className="bg-card shadow-sm hover:shadow-lg rounded-2xl border border-border p-6 transition-transform hover:-translate-y-1"
						>
							<p className="text-foreground font-medium">{feature}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

export default About;
