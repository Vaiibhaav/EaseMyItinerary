import React, { useEffect, useState } from "react";

function DayTimeSelector({ days, value, onChange }) {
	const [daySettings, setDaySettings] = useState([]);

	useEffect(() => {
		const num = Number(days) || 0;
		if (num <= 0) {
			setDaySettings([]);
			return;
		}

		const arr = [];
		for (let i = 1; i <= num; i++) {
			arr.push(
				(value && value[i - 1]) || {
					day: i,
					mode: "full",
					hours: 8,
				}
			);
		}
		setDaySettings(arr);
	}, [days, value]);

	useEffect(() => {
		if (typeof onChange === "function") onChange(daySettings);
	}, [daySettings, onChange]);

	const updateDay = (index, updates) => {
		setDaySettings((prev) => {
			const newArr = [...prev];
			newArr[index] = { ...newArr[index], ...updates };
			return newArr;
		});
	};

	return (
		<div className="flex flex-col gap-4 mt-4">
			<h3 className="text-lg font-semibold">Daily Time Availability</h3>

			{daySettings.map((d, idx) => (
				<div
					key={idx}
					className="p-4 border rounded-lg bg-card shadow-sm space-y-3"
				>
					<div className="font-medium">Day {d.day}</div>

					<div className="flex gap-2">
						<button
							className={`px-3 py-1 rounded ${
								d.mode === "full"
									? "bg-primary text-white"
									: "bg-muted text-foreground"
							}`}
							onClick={() => updateDay(idx, { mode: "full" })}
						>
							Full Day
						</button>

						<button
							className={`px-3 py-1 rounded ${
								d.mode === "custom"
									? "bg-primary text-white"
									: "bg-muted text-foreground"
							}`}
							onClick={() => updateDay(idx, { mode: "custom" })}
						>
							Custom Hours
						</button>
					</div>

					{d.mode === "custom" && (
						<div className="flex flex-col">
							<label className="text-sm">Available Hours: {d.hours} hrs</label>
							<input
								type="range"
								min="1"
								max="12"
								value={d.hours}
								onChange={(e) =>
									updateDay(idx, { hours: Number(e.target.value) })
								}
							/>
						</div>
					)}
				</div>
			))}
		</div>
	);
}

export default DayTimeSelector;
