import React from "react";

const themes = [
	"Heritage",
	"Nightlife",
	"Adventure",
	"Food",
	"Wellness",
	"Shopping",
];

function ThemesInput({ value = [], onChange }) {
	const toggleTheme = (theme) => {
		if (value.includes(theme)) {
			onChange(value.filter((t) => t !== theme));
		} else {
			onChange([...value, theme]);
		}
	};

	return (
		<div>
			<h2 className="text-xl my-3 font-medium">Themes</h2>
			<div className="flex flex-wrap gap-3">
				{themes.map((theme) => (
					<button
						key={theme}
						type="button"
						className={`px-4 py-2 rounded border ${
							value.includes(theme)
								? "bg-black text-white"
								: "bg-gray-100 text-black"
						}`}
						onClick={() => toggleTheme(theme)}
					>
						{theme}
					</button>
				))}
			</div>
		</div>
	);
}

export default ThemesInput;
