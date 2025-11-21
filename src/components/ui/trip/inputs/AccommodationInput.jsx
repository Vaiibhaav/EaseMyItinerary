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
				className="w-full rounded-lg border border-border bg-card px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				style={{ color: value ? '' : 'rgb(156, 163, 175)' }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="" disabled hidden>Select accommodation</option>
				<option value="hotel" style={{ color: 'var(--foreground)' }}>Hotel</option>
				<option value="hostel" style={{ color: 'var(--foreground)' }}>Hostel</option>
				<option value="airbnb" style={{ color: 'var(--foreground)' }}>Airbnb</option>
				<option value="guesthouse" style={{ color: 'var(--foreground)' }}>Guesthouse</option>
			</select>
		</div>
	);
}

export default AccommodationInput;
