import React, { useMemo, useEffect } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import debounce from "lodash.debounce";

function DestinationInput({ value, onChange, apiKey }) {
	// Debounce parent onChange
	const debouncedOnChange = useMemo(() => debounce(onChange, 300), [onChange]);

	// Cleanup to prevent memory leaks
	useEffect(() => {
		return () => {
			debouncedOnChange.cancel();
		};
	}, [debouncedOnChange]);

	return (
		<div>
			<h2 className="text-xl my-3 font-medium">Destination</h2>
			<GooglePlacesAutocomplete
				apiKey={apiKey}
				selectProps={{
					value,
					onChange: (v) => debouncedOnChange(v),
					placeholder: "Search your destination...",
				}}
			/>
		</div>
	);
}

export default DestinationInput;
