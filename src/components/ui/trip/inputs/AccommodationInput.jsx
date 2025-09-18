import React from "react";

function AccommodationInput({ value, onChange }) {
	return (
		<div>
			<h2 className="text-xl my-3 font-medium">Accommodation Preference</h2>
			<select
				className="border rounded p-2 w-full"
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
