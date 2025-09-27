import React from "react";

function Terms() {
	return (
		<div className="flex flex-col items-center mx-6 md:mx-56 gap-14">
			{/* Background pattern */}
			<div className="absolute inset-0 -z-10">
				<img
					src="/travel-patternjpg.jpg"
					alt="Background pattern"
					className="w-full h-full object-cover opacity-10"
				/>
			</div>

			{/* Page Title */}
			<h1 className="font-extrabold text-4xl md:text-6xl text-center mt-20 leading-snug tracking-tight">
				<span className="text-primary/80">Terms & Conditions</span>
			</h1>

			{/* Coming soon message */}
			<p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl leading-relaxed mt-6">
				Our Terms & Conditions are currently being prepared to provide clear
				usage guidelines for EaseMyItinerary.
				<br />
				<span className="font-medium text-foreground">
					📌 This page will be updated soon — stay tuned.
				</span>
			</p>
		</div>
	);
}

export default Terms;
