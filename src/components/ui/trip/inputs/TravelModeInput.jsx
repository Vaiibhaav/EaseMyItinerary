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
				className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="">Select mode</option>
				<option value="car">Car</option>
				<option value="train">Train</option>
				<option value="flight">Flight</option>
				<option value="bus">Bus</option>
			</select>
		</div>
	);
}

export default TravelModeInput;
