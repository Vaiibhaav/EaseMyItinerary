// EarthLoader.jsx
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

function Earth() {
	const earthRef = useRef();
	const texture = useLoader(
		THREE.TextureLoader,
		"/earth.jpg" // put your earth texture inside public/
	);

	useFrame(() => {
		earthRef.current.rotation.y += 0.002;
	});

	return (
		<mesh ref={earthRef}>
			<sphereGeometry args={[1.1, 64, 64]} />
			<meshStandardMaterial map={texture} />
		</mesh>
	);
}

function Plane({ radius, speed, offset }) {
	const ref = useRef();

	useFrame(({ clock }) => {
		const t = clock.getElapsedTime() * speed + offset;
		ref.current.position.x = Math.cos(t) * radius;
		ref.current.position.z = Math.sin(t) * radius;
		ref.current.position.y = Math.sin(t * 2) * 0.2;
		ref.current.rotation.y = -t + Math.PI / 2;
	});

	return (
		<mesh ref={ref} scale={0.07}>
			<coneGeometry args={[0.3, 1, 8]} />
			<meshStandardMaterial color="#ffcc00" />
		</mesh>
	);
}

export default function EarthLoader() {
	return (
		<div style={{ width: "200px", height: "200px" }}>
			<Canvas camera={{ position: [0, 2, 4] }}>
				<ambientLight intensity={0.4} />
				<directionalLight position={[5, 5, 5]} intensity={1} />

				<Earth />

				{Array.from({ length: 4 }).map((_, i) => (
					<Plane
						key={i}
						radius={2}
						speed={0.6 + Math.random() * 0.3}
						offset={i * Math.PI * 0.5}
					/>
				))}
			</Canvas>
		</div>
	);
}
