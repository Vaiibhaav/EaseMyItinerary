// MapRoutes.jsx (FINAL — STRICT MODE: ONLY REAL DRIVABLE ROUTES)

// ❗ NO FALLBACK ROUTES
// ❗ If distance > 200 km → show NO ROUTE
// ❗ If Google returns NO_ROUTE → show NO ROUTE
// ❗ ABC markers are preserved
// ❗ No fake/stitched polylines will ever be drawn

import React, { useEffect, useState, useCallback } from "react";
import {
	useJsApiLoader,
	GoogleMap,
	Polyline,
	Marker,
} from "@react-google-maps/api";

const MAP_LIBRARIES = ["places"];
const API_BASE =
	import.meta.env.VITE_API_BASE ||
	(import.meta.env.DEV ? "http://localhost:3001" : "");
const computeUrl = (path) => (API_BASE ? `${API_BASE}${path}` : path);

export default function MapRoutes({ locations = [], travelMode = "DRIVE" }) {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
		libraries: MAP_LIBRARIES,
	});

	const [geoCoords, setGeoCoords] = useState(null);
	const [distance, setDistance] = useState("");
	const [duration, setDuration] = useState("");
	const [error, setError] = useState(null);
	const [markerPoints, setMarkerPoints] = useState([]);

	// GET ROUTE FROM BACKEND
	const fetchRoute = useCallback(async () => {
		if (!isLoaded) return;
		if (!locations || locations.length < 2) {
			setError("Need at least 2 valid locations.");
			return;
		}

		try {
			setError(null);
			setGeoCoords(null);
			setMarkerPoints([]);

			const response = await fetch(computeUrl("/api/compute-route"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ locations, travelMode }),
			});

			const data = await response.json();

			// ❌ If server says NO_ROUTE → do not fallback
			if (!response.ok || !data?.geoJson) {
				setError("No drivable route available.");
				return;
			}

			// --- Extract polyline ---
			const coords = data.geoJson.coordinates.map(([lng, lat]) => ({
				lat,
				lng,
			}));

			// ❌ ADD SAFETY CHECK: If total distance > 200 km → probably wrong city, reject route
			if (data.distanceMeters > 200_000) {
				setError("No drivable route available.");
				return;
			}

			setGeoCoords(coords);

			// Show distance + duration only when valid
			setDistance(`${(data.distanceMeters / 1000).toFixed(1)} km`);
			setDuration(
				data.duration ? `${Math.round(parseFloat(data.duration) / 60)} min` : ""
			);

			// Load markers
			geocodeAllLocations();
		} catch (err) {
			setError("No drivable route available.");
		}
	}, [isLoaded, locations, travelMode]);

	// GEOCODE MARKERS ONLY (NO SNAPPING)
	const geocodeAllLocations = async () => {
		const geocoder = new window.google.maps.Geocoder();
		const output = [];

		for (const loc of locations) {
			const point = await new Promise((resolve) => {
				geocoder.geocode({ address: loc }, (res, status) => {
					if (status === "OK" && res[0])
						resolve(res[0].geometry.location.toJSON());
					else resolve(null);
				});
			});
			output.push(point);
		}

		setMarkerPoints(output);
	};

	useEffect(() => {
		fetchRoute();
	}, [fetchRoute]);

	if (!isLoaded) return <div className="p-4 text-center">Loading map...</div>;

	return (
		<div className="w-full mt-4 rounded-xl overflow-hidden border shadow">
			<div className="w-full h-[350px] relative">
				<GoogleMap
					center={geoCoords?.[0] || markerPoints?.[0] || { lat: 20, lng: 78 }}
					zoom={geoCoords ? 13 : 5}
					mapContainerStyle={{ width: "100%", height: "100%" }}
					options={{
						zoomControl: true,
						streetViewControl: false,
						mapTypeControl: false,
						fullscreenControl: false,
					}}
				>
					{/* REAL ROUTE ONLY */}
					{geoCoords && (
						<Polyline
							path={geoCoords}
							options={{
								strokeColor: "#2563eb",
								strokeOpacity: 0.9,
								strokeWeight: 5,
							}}
						/>
					)}

					{/* KEEP A/B/C MARKERS */}
					{markerPoints.map(
						(pos, i) =>
							pos && (
								<Marker
									key={i}
									position={pos}
									label={{
										text: String.fromCharCode(65 + i),
										color: "#fff",
										fontWeight: "bold",
									}}
									icon={{
										path: window.google.maps.SymbolPath.CIRCLE,
										scale: 14,
										fillColor: "#2563eb",
										fillOpacity: 1,
										strokeColor: "#ffffff",
										strokeWeight: 2,
									}}
								/>
							)
					)}
				</GoogleMap>

				{/* ❗ Show error overlay instead of fake route */}
				{error && (
					<div className="absolute inset-0 flex items-center justify-center bg-white/80 text-red-700 font-semibold text-center p-3">
						{error}
					</div>
				)}
			</div>

			{/* Only show stats when valid */}
			{!error && (
				<div className="p-4 bg-white border-t flex justify-between text-sm">
					<div>
						<strong>Distance:</strong> {distance}
					</div>
					<div>
						<strong>Duration:</strong> {duration}
					</div>
				</div>
			)}
		</div>
	);
}
