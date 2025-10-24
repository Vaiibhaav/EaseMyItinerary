import React from "react";
import { useTranslation } from "react-i18next";
import DemoReviews from "../../../service/DemoReviews";
import { Button } from "../button";
import { Link } from "react-router-dom";
import Hero from "./Hero";
import FlyingPlane from "./FlyingPlane";
import HeritageShowcase from "./HeritageShowcase";

function Landing() {
	return (
		<>
			{/* Regular content */}
			<Hero />
			{/* <FlyingPlane /> */}
			{/* Make showcase full-screen scrollable outside flex context */}
			{/* <div className="w-full overflow-visible">
				<HeritageShowcase />
			</div> */}

			{/* Resume normal layout below */}
			<div className="flex flex-col items-center mx-6 md:mx-56 gap-14 relative z-10">
				<DemoReviews />
			</div>
		</>
	);
}

export default Landing;
