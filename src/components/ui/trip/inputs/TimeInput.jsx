import React from "react";

function TimeInput({ value, onChange }) {
	return (
		<div>
			<h2 className="text-xl my-3 font-medium">Available Time (per day)</h2>
			<select
				className="border rounded p-2 w-full"
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
