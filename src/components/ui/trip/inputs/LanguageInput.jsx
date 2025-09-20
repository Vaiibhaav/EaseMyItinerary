import React from "react";

function LanguageInput({ value, onChange }) {
	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Language Preference
			</label>

			{/* Select dropdown */}
			<select
				className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="">-- Select a language --</option>
				<option value="English">English</option>
				<option value="Hindi">Hindi</option>
				<option value="Bengali">Bengali</option>
				<option value="Telugu">Telugu</option>
				<option value="Marathi">Marathi</option>
				<option value="Tamil">Tamil</option>
				<option value="Gujarati">Gujarati</option>
				<option value="Kannada">Kannada</option>
				<option value="Malayalam">Malayalam</option>
				<option value="Punjabi">Punjabi</option>
			</select>
		</div>
	);
}

export default LanguageInput;
