import React from "react";

function StartDateInput({ value, onChange }) {
	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Trip Start Date
			</label>

			{/* Date Picker Input */}
			<input
				type="date"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full rounded-lg px-3 py-2 bg-card text-foreground border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
			/>
		</div>
	);
}

export default StartDateInput;
