import React from "react";

function StartDateInput({ value, onChange }) {
	return (
		<div>
			<h2 className="text-xl my-3 font-medium">Trip Start Date</h2>
			<input
				type="date"
				className="border rounded p-2 w-full"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}

export default StartDateInput;
