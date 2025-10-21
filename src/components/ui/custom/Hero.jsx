import React from 'react'
import { Button } from "../button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
    const { t } = useTranslation();
    return (
		<div className="m-60 ">
			<div className="absolute inset-0 -z-10">
				<img
					src="/travel-patternjpg.jpg"
					alt="Background pattern"
					className="w-full h-full object-cover opacity-20"
				/>
			</div>
			{/* Hero Section */}
			<h1 className="font-extrabold text-4xl md:text-6xl text-center mt-20 leading-snug tracking-tight">
				<span className="text-primary/80">{t("AI-Powered Itineraries")}</span>
				<br />
				<span className="text-muted-foreground font-medium">
					{t("Tailored, Bookable, Instant.")}
				</span>
			</h1>

			<p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl">
				{t(
					"Generate end-to-end, optimized itineraries based on budget, time, and interests. Adapt in real time and book everything with one click."
				)}
			</p>

			<Link to={"/create-trip"}>
				<Button className="px-7 py-3 text-lg rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition">
					{t("Get Started")}
				</Button>
			</Link>
		</div>
	);
}

export default Hero
