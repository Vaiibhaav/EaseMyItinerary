import React from "react";

const AMENITIES = [
	{ id: "SWIMMING_POOL", label: "Swimming Pool" },
	{ id: "SPA", label: "Spa" },
	{ id: "FITNESS_CENTER", label: "Fitness Center" },
	{ id: "AIR_CONDITIONING", label: "Air Conditioning" },
	{ id: "RESTAURANT", label: "Restaurant" },
	{ id: "PARKING", label: "Parking" },
	{ id: "WIFI", label: "WiFi" },
	{ id: "MEETING_ROOMS", label: "Meeting Rooms" },
	{ id: "VALET_PARKING", label: "Valet Parking" },
	{ id: "BAR_OR_LOUNGE", label: "Bar or Lounge" },
	{ id: "TELEVISION", label: "Television" },
	{ id: "ROOM_SERVICE", label: "Room Service" },
	{ id: "GUARDED_PARKING", label: "Guarded Parking" },
];

function HotelAmenitiesInput({ value, onChange }) {
	const handleToggle = (amenityId) => {
		if (value.includes(amenityId)) {
			onChange(value.filter((id) => id !== amenityId));
		} else {
			onChange([...value, amenityId]);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{/* Label */}
			<label className="text-lg font-semibold text-foreground">
				Hotel Amenities
			</label>

			{/* Checkbox grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border border-border rounded-lg bg-card">
				{AMENITIES.map((amenity) => (
					<label
						key={amenity.id}
						className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition"
					>
						<input
							type="checkbox"
							checked={value.includes(amenity.id)}
							onChange={() => handleToggle(amenity.id)}
							className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
						/>
						<span className="text-sm text-foreground">{amenity.label}</span>
					</label>
				))}
			</div>
		</div>
	);
}

export default HotelAmenitiesInput;

