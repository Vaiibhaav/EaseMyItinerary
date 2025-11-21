import React from "react";

function TravelModeInput({ value, onChange }) {
	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Preferred Travel Mode
			</label>

			{/* Select dropdown */}
			<select
				className="w-full rounded-lg border border-border bg-card px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				style={{ color: value ? '' : 'rgb(156, 163, 175)' }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="" disabled hidden>Select mode</option>
				<option value="car" style={{ color: 'var(--foreground)' }}>Car</option>
				<option value="train" style={{ color: 'var(--foreground)' }}>Train</option>
				<option value="flight" style={{ color: 'var(--foreground)' }}>Flight</option>
				<option value="bus" style={{ color: 'var(--foreground)' }}>Bus</option>
			</select>
		</div>
	);
}

export default TravelModeInput;
