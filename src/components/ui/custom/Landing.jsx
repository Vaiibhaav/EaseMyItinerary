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
			<Hero />
			<div className="w-full relative z-10">
				<DemoReviews />
			</div>
		</>
	);
}

export default Landing;
