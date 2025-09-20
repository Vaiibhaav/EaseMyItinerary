import React from "react";

function TimeInput({ value, onChange }) {
	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Available Time (per day)
			</label>

			{/* Select dropdown */}
			<select
				className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="">Select time availability</option>
				<option value="full">Full Day</option>
				<option value="half">Half Day</option>
				<option value="evening">Evening Only</option>
			</select>
		</div>
	);
}

export default TimeInput;
