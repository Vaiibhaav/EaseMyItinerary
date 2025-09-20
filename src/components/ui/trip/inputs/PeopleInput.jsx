import React, { useMemo, useEffect, useState } from "react";
import debounce from "lodash/debounce";

function PeopleInput({ value, onChange }) {
	const [error, setError] = useState("");

	const debouncedOnChange = useMemo(
		() =>
			debounce((val) => {
				if (val === "" || !isNaN(Number(val))) {
					setError("");
					onChange(val);
				} else {
					setError("Please enter a valid number");
				}
			}, 400),
		[onChange]
	);

	useEffect(() => {
		return () => {
			debouncedOnChange.cancel();
		};
	}, [debouncedOnChange]);

	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Number of People
			</label>

			{/* Input */}
			<input
				type="text"
				placeholder="e.g. 2"
				defaultValue={value}
				onChange={(e) => debouncedOnChange(e.target.value)}
				className={`w-full rounded-lg px-3 py-2 bg-card text-foreground border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition ${
					error ? "border-red-500" : "border-border"
				}`}
			/>

			{/* Error */}
			{error && <p className="text-red-500 text-sm italic">{error}</p>}
		</div>
	);
}

export default PeopleInput;
