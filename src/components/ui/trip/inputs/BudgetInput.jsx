import React, { useMemo, useEffect, useState } from "react";
import debounce from "lodash/debounce";


function BudgetInput({ value, onChange }) {
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
		<div>
			<h2 className="text-xl my-3 font-medium">Budget</h2>
			<input
				type="text"
				placeholder="Total budget (INR)"
				className={`border rounded p-2 w-full ${
					error ? "border-red-500" : "border-gray-300"
				}`}
				defaultValue={value}
				onChange={(e) => debouncedOnChange(e.target.value)}
			/>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
}

export default BudgetInput;
