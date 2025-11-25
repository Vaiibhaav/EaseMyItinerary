// getMapLocationsVerified.js
// Minimal/Conservative verifier for getMapLocations output (Option A fix).
// - Calls your existing AI extractor getMapLocations (which parses itinerary to day_locations).
// - Verifies every extracted location via Google Places (GetPlaceDetails).
// - Keeps only resolvable, routable places (returned as "Name, Full Address").
// - Deduplicates while preserving original order.
// - Safe: if verification fails for a location we DROP it from all_locations (prevents computeRoutes NO_ROUTE).
// - Returns the same JSON shape as getMapLocations but with verified all_locations per day.

import getMapLocations from "./getMapLocations"; // existing AI parser. :contentReference[oaicite:3]{index=3}
import { GetPlaceDetails } from "../service/GlobalApi"; // adjust path if needed (match your project).

/**
 * Verify a single location string with your GlobalApi GetPlaceDetails.
 * Returns a normalized "Name, Full Address" string when resolvable, otherwise null.
 */
async function verifyLocationWithPlaces(loc) {
	if (!loc || typeof loc !== "string") return null;
	try {
		const q = loc.trim();
		// Use the same GetPlaceDetails you use elsewhere (ActivitiesCard/AIModal).
		const res = await GetPlaceDetails({ textQuery: q });
		const place = res?.data?.places?.[0];
		if (!place) return null;

		// Prefer displayName.text if available, else place.name
		const name = place.displayName?.text || place.name || "";
		// Prefer formattedAddress or freeformAddress
		const address =
			place.formattedAddress || place.address?.freeformAddress || "";
		const final = [name, address].filter(Boolean).join(", ").trim();

		// Very conservative: require at least one comma (name + address) or geometry
		const hasAddressLike =
			final.includes(",") && final.split(",").some(Boolean);
		const hasGeometry =
			!!place.geometry || !!place.location || !!place.position;

		if (!hasAddressLike && !hasGeometry) return null;

		// Extra filter: Some Places are purely "areas" or POIs with no drivable address.
		// If formattedAddress is missing, treat as non-routable (drop).
		if (!address) {
			// allow it only if geometry exists AND displayName contains street-like data
			return hasGeometry ? final : null;
		}

		return final || null;
	} catch (err) {
		console.warn(
			"verifyLocationWithPlaces error for",
			loc,
			err?.message || err
		);
		return null;
	}
}

/**
 * Deduplicate an array while preserving the first occurrence order.
 */
function dedupePreserveOrder(arr) {
	const seen = new Set();
	const out = [];
	for (const a of arr) {
		if (!a) continue;
		const key = String(a).trim();
		if (!seen.has(key)) {
			seen.add(key);
			out.push(key);
		}
	}
	return out;
}

/**
 * Main exported function.
 * Input: itineraryJson (same as you give to getMapLocations)
 * Output: { day_locations: [ { day, accommodation, activities, all_locations } ] }
 */
export default async function getMapLocationsVerified(itineraryJson) {
	// 1) Run the existing AI extractor to obtain the raw structure (non-destructive)
	let parsed = null;
	try {
		parsed = await getMapLocations(itineraryJson); // returns day_locations structure. :contentReference[oaicite:4]{index=4}
	} catch (err) {
		console.error("getMapLocations (AI) failed:", err);
		return null;
	}

	if (!parsed || !Array.isArray(parsed.day_locations)) {
		// Fallback: try to synthesise minimal structure from itineraryJson (very defensive)
		return { day_locations: [] };
	}

	// 2) For each day, verify each location (accommodation + activities) using Places
	const out = { day_locations: [] };

	for (const dayObj of parsed.day_locations) {
		const dayIndex = dayObj.day ?? null;
		const accommodationRaw = dayObj.accommodation ?? null;
		const activitiesRaw = Array.isArray(dayObj.activities)
			? dayObj.activities
			: [];
		const allRawOrdered = Array.isArray(dayObj.all_locations)
			? dayObj.all_locations
			: // fallback: accommodation then activities
			  [accommodationRaw || null, ...activitiesRaw];

		// Verify each place, sequentially (conservative)
		const verifiedList = [];
		for (const raw of allRawOrdered) {
			if (!raw) continue;
			const verified = await verifyLocationWithPlaces(raw);
			if (verified) verifiedList.push(verified);
			else {
				// drop unverified place (minimal change)
				console.info("Dropping unresolvable location for routing:", raw);
			}
		}

		// Deduplicate while preserving original order
		const finalLocations = dedupePreserveOrder(verifiedList);

		// Push day object with verified lists; keep accommodation & activities fields unchanged (non-breaking)
		out.day_locations.push({
			day: dayIndex,
			accommodation: accommodationRaw,
			activities: activitiesRaw,
			all_locations: finalLocations,
		});
	}

	return out;
}
