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

					const opacity = useTransform(
						scrollYProgress,
						[start, start + step * 0.25, end - step * 0.25, end],
						[0, 1, 1, 0]
					);
					const scale = useTransform(scrollYProgress, [start, end], [1.15, 1]);
					const y = useTransform(scrollYProgress, [start, end], [80, 0]);
					const textY = useTransform(scrollYProgress, [start, end], [50, 0]);

					return (
						<motion.div
							key={i}
							style={{ opacity, scale, y }}
							className="absolute inset-0 flex flex-col items-center justify-center"
						>
							{/* Fullscreen Image */}
							<div className="relative w-screen h-screen overflow-hidden">
								<motion.img
									src={item.src}
									alt={item.title}
									className="absolute inset-0 w-full h-full object-cover"
								/>
							</div>

							{/* Elegant Text Overlay */}
							<motion.div
								style={{ opacity, y: textY }}
								className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
							>
								<h2 className="text-4xl md:text-6xl font-bold tracking-wide text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)] mb-4">
									{item.title}
								</h2>
								<p className="max-w-2xl text-base md:text-xl text-gray-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
									{item.desc}
								</p>
							</motion.div>

							{/* optional subtle overlay for readability */}
							<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
						</motion.div>
					);
				})}
			</div>
		</section>
	);
};

export default HeritageShowcase;
