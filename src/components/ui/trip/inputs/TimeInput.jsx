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
				className="w-full rounded-lg border border-border bg-card px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				style={{ color: value ? "" : "rgb(156, 163, 175)" }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="" disabled hidden>
					Select time availability
				</option>
				<option value="full" style={{ color: "var(--foreground)" }}>
					Full Day
				</option>
				<option value="half" style={{ color: "var(--foreground)" }}>
					Half Day
				</option>
				<option value="evening" style={{ color: "var(--foreground)" }}>
					Evening Only
				</option>
			</select>
		</div>
	);
}

export default TimeInput;
