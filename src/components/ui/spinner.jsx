import { cn } from "@/lib/utils";

// Custom spinner matching the minimalist white-on-black design (12-14 dashes radiating outward)
function Spinner({ className, size = "md", ...props }) {
	const sizeClasses = {
		sm: "w-8 h-8",
		md: "w-12 h-12",
		lg: "w-16 h-16",
		xl: "w-20 h-20",
	};

	return (
		<div
			role="status"
			aria-label="Loading"
			className={cn(
				"relative inline-block",
				sizeClasses[size],
				className
			)}
			{...props}
		>
			<svg
				className="animate-spin w-full h-full"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				{/* Create 12 dashes in a circle, radiating outward from center */}
				{Array.from({ length: 12 }).map((_, i) => {
					const angle = (i * 360) / 12;
					const radians = (angle * Math.PI) / 180;
					const centerX = 12;
					const centerY = 12;
					const radius = 8;
					const dashLength = 3;
					
					// Start point (inner)
					const x1 = centerX + (radius - dashLength) * Math.sin(radians);
					const y1 = centerY - (radius - dashLength) * Math.cos(radians);
					// End point (outer)
					const x2 = centerX + radius * Math.sin(radians);
					const y2 = centerY - radius * Math.cos(radians);
					
					return (
						<line
							key={i}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							opacity={0.4 + (i % 3) * 0.15}
						/>
					);
				})}
			</svg>
		</div>
	);
}

// Full-screen spinner overlay (for trip generation, updates, etc.)
export function SpinnerOverlay({ message = "Loading..." }) {
	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
			<div className="flex flex-col items-center gap-4">
				<Spinner size="xl" className="text-white" />
				{message && (
					<p className="text-white text-lg font-medium">{message}</p>
				)}
			</div>
		</div>
	);
}

// Inline spinner (for buttons, small areas)
export function SpinnerInline({ className, size = "sm" }) {
	return (
		<div className={cn("flex items-center justify-center", className)}>
			<Spinner size={size} className="text-current" />
		</div>
	);
}

// Spinner for image loading
export function SpinnerImage({ className }) {
	return (
		<div
			className={cn(
				"absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg",
				className
			)}
		>
			<Spinner size="md" className="text-white" />
		</div>
	);
}

export { Spinner };
