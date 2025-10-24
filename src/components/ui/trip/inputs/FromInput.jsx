import React, { useMemo, useEffect } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import debounce from "lodash.debounce";

function FromInput({ value, onChange, apiKey }) {
	const debouncedOnChange = useMemo(() => debounce(onChange, 300), [onChange]);

	useEffect(() => {
		return () => {
			debouncedOnChange.cancel();
		};
	}, [debouncedOnChange]);

	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Starting Location
			</label>

			{/* Google Autocomplete Input */}
			<div className="rounded-lg border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary transition">
				<GooglePlacesAutocomplete
					apiKey={apiKey}
					selectProps={{
						value,
						onChange: (v) => debouncedOnChange(v),
						placeholder: "Where will your trip start?",
						styles: {
							control: (provided) => ({
								...provided,
								backgroundColor: "transparent",
								border: "none",
								boxShadow: "none",
								minHeight: "42px",
								paddingLeft: "6px",
								color: "var(--foreground)",
							}),
							input: (provided) => ({
								...provided,
								color: "var(--foreground)",
							}),
							singleValue: (provided) => ({
								...provided,
								color: "var(--foreground)",
								fontWeight: 500,
							}),
							placeholder: (provided) => ({
								...provided,
								color: "var(--muted-foreground)",
								fontWeight: 400,
							}),
							option: (provided, state) => ({
								...provided,
								backgroundColor: state.isFocused
									? "var(--accent)"
									: "transparent",
								color: "var(--foreground)",
								cursor: "pointer",
							}),
							menu: (provided) => ({
								...provided,
								backgroundColor: "var(--card)",
								border: "1px solid var(--border)",
								borderRadius: "0.5rem",
								marginTop: "4px",
								zIndex: 20,
							}),
						},
					}}
				/>
			</div>
		</div>
	);
}

export default FromInput;
