import React from "react";

function TravelModeInput({ value, onChange }) {
	return (
		<div>
			<h2 className="text-xl my-3 font-medium">Preferred Travel Mode</h2>
			<select
				className="border rounded p-2 w-full"
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
