import React from "react";

function LanguageInput({ value, onChange }) {
	return (
		<div>
			<h2 className="text-xl my-3 font-medium">Language Preference</h2>
			<select
				className="border rounded p-2 w-full"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="">-- Select a language --</option> {/* 👈 added */}
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
