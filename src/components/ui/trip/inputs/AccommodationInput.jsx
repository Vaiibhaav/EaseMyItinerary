import React from "react";

function AccommodationInput({ value, onChange }) {
	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Accommodation Preference
			</label>

			{/* Select dropdown */}
			<select
				className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="">Select accommodation</option>
				<option value="hotel">Hotel</option>
				<option value="hostel">Hostel</option>
				<option value="airbnb">Airbnb</option>
				<option value="guesthouse">Guesthouse</option>
			</select>
		</div>
	);
}

export default AccommodationInput;
