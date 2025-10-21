import React from 'react'
import { motion, useScroll, useTransform } from "framer-motion";

const FlyingPlane = () => {
    const { scrollYProgress } = useScroll();
	const x = useTransform(scrollYProgress, [0, 1], ["-20%", "120%"]); // horizontal
	const y = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]); // vertical
	const rotate = useTransform(scrollYProgress, [0, 1], ["0deg", "10deg"]);
    return (
			<div>
				<motion.img
					src="/logo.svg"
					alt="Flying plane"
					style={{
						position: "fixed",
						top: "20%", // vertical position (adjust as needed)
						left: 0,
						width: "80px",
						zIndex: 9999,
						x: useTransform(scrollYProgress, [0, 1], ["-20vw", "120vw"]), // full viewport width
						y: useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]),
						rotate: useTransform(scrollYProgress, [0, 1], ["0deg", "0deg"]),
					}}
					className="drop-shadow-xl opacity-50 pointer-events-none"
				/>
			</div>
		);
}

export default FlyingPlane
