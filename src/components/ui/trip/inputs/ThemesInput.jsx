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
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">Themes</label>

			{/* Theme selection */}
			<div className="flex flex-wrap gap-3">
				{themes.map((theme) => {
					const selected = value.includes(theme);
					return (
						<button
							key={theme}
							type="button"
							onClick={() => toggleTheme(theme)}
							className={`px-4 py-2 rounded-full text-sm font-medium transition shadow-sm
                ${
									selected
										? "bg-primary text-primary-foreground hover:bg-primary/90"
										: "bg-accent/40 text-foreground hover:bg-accent/60"
								}`}
						>
							{theme}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default ThemesInput;
