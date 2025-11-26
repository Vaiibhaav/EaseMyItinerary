import React from "react";

function HotelRatingInput({ value, onChange }) {
	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Hotel Star Rating
			</label>

			{/* Select dropdown */}
			<select
				className="w-full rounded-lg border border-border bg-card px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				style={{ color: value ? '' : 'rgb(156, 163, 175)' }}
				value={value || "3"}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="1" style={{ color: 'var(--foreground)' }}>⭐ 1 Star</option>
				<option value="2" style={{ color: 'var(--foreground)' }}>⭐⭐ 2 Stars</option>
				<option value="3" style={{ color: 'var(--foreground)' }}>⭐⭐⭐ 3 Stars (Default)</option>
				<option value="4" style={{ color: 'var(--foreground)' }}>⭐⭐⭐⭐ 4 Stars</option>
				<option value="5" style={{ color: 'var(--foreground)' }}>⭐⭐⭐⭐⭐ 5 Stars</option>
			</select>
		</div>
	);
}

export default HotelRatingInput;

