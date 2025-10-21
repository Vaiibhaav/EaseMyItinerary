import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

const HeritageShowcase = () => {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"],
	});

	const heritageImages = [
		{
			src: "/heritage/tajmahal1.jpg",
			title: "Taj Mahal, Agra",
			desc: "A marble symphony of love and timeless beauty on the banks of the Yamuna.",
		},
		{
			src: "/heritage/peacock.jpg",
			title: "Hampi, Karnataka",
			desc: "The stone whispers of Vijayanagara — ruins alive with history and myth.",
		},
		{
			src: "/heritage/wp6736577.jpg",
			title: "Amber Fort, Jaipur",
			desc: "Golden ramparts reflecting Rajasthan’s regal past and majestic artistry.",
		},
		{
			src: "/heritage/jaipur-city-palace.png",
			title: "Ghats of Varanasi",
			desc: "Where faith meets the Ganges — an eternal dance of devotion and life.",
		},
	];

	const total = heritageImages.length;
	const step = 1 / total;

	return (
		<section ref={ref} className="relative h-[450vh] overflow-visible">
			<div className="sticky top-0 h-screen w-full flex items-center justify-center">
				{heritageImages.map((item, i) => {
					const start = i * step;
					const end = start + step;
					const fromLeft = i % 2 === 0;

					// Smooth appear/disappear
					const opacity = useTransform(
						scrollYProgress,
						[start, start + step * 0.25, end - step * 0.25, end],
						[0, 1, 1, 0]
					);

					// Image slides from one side
					const xImage = useTransform(
						scrollYProgress,
						[start, start + step * 0.25, end - step * 0.25, end],
						fromLeft
							? ["-100%", "0%", "0%", "-100%"]
							: ["100%", "0%", "0%", "100%"]
					);

					// Text slides from the opposite side
					const xText = useTransform(
						scrollYProgress,
						[start, start + step * 0.25, end - step * 0.25, end],
						fromLeft
							? ["100%", "0%", "0%", "100%"]
							: ["-100%", "0%", "0%", "-100%"]
					);

					return (
						<motion.div
							key={i}
							className="absolute inset-0 flex h-full w-full"
							style={{ opacity }}
						>
							{/* Image Section (80%) */}
							<motion.div
								className="relative h-full w-[80%] overflow-hidden"
								style={{ x: xImage }}
							>
								<img
									src={item.src}
									alt={item.title}
									className="w-full h-full object-cover"
								/>
							</motion.div>

							{/* Text Section (20%) */}
							<motion.div
								className="flex flex-col justify-center items-start px-10 text-black bg-transparent w-[20%]"
								style={{ x: xText }}
							>
								<h2 className="text-3xl md:text-5xl font-bold mb-4">
									{item.title}
								</h2>
								<p className="text-base md:text-lg text-gray-700">
									{item.desc}
								</p>
							</motion.div>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
};

export default HeritageShowcase;
