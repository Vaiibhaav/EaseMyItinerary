// backend/computeRoute.js
// FIXED – Uses correct Google Routes API GA format

const fetch = require("node-fetch");

async function computeRoute(locations = [], travelMode = "DRIVE") {
	if (!Array.isArray(locations) || locations.length < 2) {
		return { error: "At least origin and destination required" };
	}

	const API_KEY = process.env.GOOGLE_ROUTES_API_KEY;
	if (!API_KEY) {
		return { error: "Missing GOOGLE_ROUTES_API_KEY in environment" };
	}

	const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}`;

	const headers = {
		"Content-Type": "application/json",
		"X-Goog-FieldMask":
			"routes.polyline.geoJsonLinestring,routes.distanceMeters,routes.duration",
	};

	// ✅ Correct GA format — NO waypoint wrapper
	const body = {
		origin: { address: locations[0] },
		destination: { address: locations[locations.length - 1] },
		intermediates: locations.slice(1, -1).map((loc) => ({ address: loc })),
		travelMode: travelMode === "WALK" ? "WALK" : "DRIVE",
		polylineQuality: "HIGH_QUALITY",
		polylineEncoding: "GEO_JSON_LINESTRING",
	};

	// Attempt DRIVE first
	let response = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});
	let json = await response.json();

	const hasRoute =
		json?.routes?.length && json.routes[0]?.polyline?.geoJsonLinestring;

	// Fallback to WALK
	if (!hasRoute) {
		body.travelMode = "WALK";
		response = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		});
		json = await response.json();
	}

	if (!json || !json.routes || json.routes.length === 0) {
		return { error: "NO_ROUTE", details: json };
	}

	const route = json.routes[0];

	return {
		success: true,
		distanceMeters: route.distanceMeters,
		duration: route.duration,
		geoJson: route.polyline.geoJsonLinestring,
	};
}

module.exports = computeRoute;
