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
				className="w-full rounded-lg border border-border bg-card px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
				style={{ color: value ? '' : 'rgb(156, 163, 175)' }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="" disabled hidden>-- Select a language --</option>
				<option value="English" style={{ color: 'var(--foreground)' }}>English</option>
				<option value="Hindi" style={{ color: 'var(--foreground)' }}>Hindi</option>
				<option value="Bengali" style={{ color: 'var(--foreground)' }}>Bengali</option>
				<option value="Telugu" style={{ color: 'var(--foreground)' }}>Telugu</option>
				<option value="Marathi" style={{ color: 'var(--foreground)' }}>Marathi</option>
				<option value="Tamil" style={{ color: 'var(--foreground)' }}>Tamil</option>
				<option value="Gujarati" style={{ color: 'var(--foreground)' }}>Gujarati</option>
				<option value="Kannada" style={{ color: 'var(--foreground)' }}>Kannada</option>
				<option value="Malayalam" style={{ color: 'var(--foreground)' }}>Malayalam</option>
				<option value="Punjabi" style={{ color: 'var(--foreground)' }}>Punjabi</option>
			</select>
		</div>
	);
}

export default LanguageInput;
