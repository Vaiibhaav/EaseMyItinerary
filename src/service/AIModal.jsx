// AIModal.jsx — RESTORED ORIGINAL (A) + NON-BREAKING ADD-ONS
// - Restores the original AIModal behavior (schema + rules)
// - Adds a safe post-processing layer that verifies/cleans locations via Google Places
// - Adds strict budget enforcement instructions in the prompt (non-breaking)
// - Cleans place-query strings to avoid Places API 400 errors

import { GoogleGenAI } from "@google/genai";
import { GetPlaceDetails } from "../service/GlobalApi";

const ai = new GoogleGenAI({
	apiKey: import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY,
});

function extractText(response) {
	if (!response) return "";
	if (typeof response.text === "string") return response.text;
	if (Array.isArray(response.output))
		return response.output.map((p) => p?.text || "").join("");
	if (Array.isArray(response.candidates))
		return response.candidates
			.map((c) => c.output_text || c.content || JSON.stringify(c))
			.join("\n");
	return String(response);
}

function cleanTextForJson(s) {
	if (!s) return s;
	return s
		.replace(/```json/g, "")
		.replace(/```/g, "")
		.trim();
}

function tryParseJsonFromText(text) {
	if (!text || typeof text !== "string") return null;
	const cleaned = cleanTextForJson(text);
	try {
		return JSON.parse(cleaned);
	} catch {
		const match = cleaned.match(/(\{[\s\S]*\})/);
		if (match) {
			try {
				return JSON.parse(match[1]);
			} catch {}
		}
		return null;
	}
}

function normalizeItinerary(raw) {
	if (!raw || typeof raw !== "object") return null;
	return {
		from: raw.from || raw.tripDetails?.from || "",
		destination: raw.destination || raw.tripDetails?.destination || "",
		start_date: raw.start_date || raw.tripDetails?.startDate || "",
		number_of_days: Number(raw.number_of_days || raw.tripDetails?.days) || 0,
		number_of_people:
			Number(raw.number_of_people) || Number(raw.tripDetails?.people) || 1,
		budget_inr: Number(raw.budget_inr || raw.tripDetails?.budget) || null,
		themes: raw.themes || raw.tripDetails?.themes || [],
		language_preference:
			raw.language_preference || raw.tripDetails?.language || "English",
		travel_mode_preference:
			raw.travel_mode_preference || raw.tripDetails?.travelMode || "",
		accommodation_preference:
			raw.accommodation_preference || raw.tripDetails?.accommodation || "",
		notes: raw.notes || "",
		// Accept both daily_itinerary and dailyItinerary from model; map camelCase -> snake_case
		daily_itinerary:
			raw.daily_itinerary && Array.isArray(raw.daily_itinerary)
				? raw.daily_itinerary
				: raw.dailyItinerary && Array.isArray(raw.dailyItinerary)
				? raw.dailyItinerary.map(convertActivityDayCamelToSnake)
				: [],
		warnings: raw.warnings || [],
	};
}

// Helper: convert a single day from various possible AI shapes to expected snake_case
function convertActivityDayCamelToSnake(day) {
	if (!day || typeof day !== "object") return day;
	// Attempt to standardize keys the UI expects: date, day_of_week, theme_focus, accommodation, activities, travel, budget_estimate_usd
	return {
		date: day.date || day.Date || day.dayDate || "",
		day_of_week: day.day_of_week || day.dayOfWeek || day.day || "",
		theme_focus: day.theme_focus || day.theme || day.theme_focus || "",
		accommodation: day.accommodation || day.hotel || null,
		activities: (day.activities || day.activityList || day.itinerary || []).map(
			convertActivityCamelToSnake
		),
		travel: day.travel || day.transport || null,
		budget_estimate_usd: day.budget_estimate_usd || day.budgetBreakdown || null,
	};
}

function convertActivityCamelToSnake(act) {
	if (!act || typeof act !== "object") return act;
	return {
		time: act.time || act.Time || act.when || "",
		category: act.category || act.type || "",
		description: act.description || act.desc || act.title || "",
		location: act.location || act.place || act.address || "",
	};
}

// -------------------------------
// NON-BREAKING ADD-ON: Place verification + sanitization
// - Safe: only modifies location strings after the AI output
// - Defensive: cleans queries to avoid Places API 400s
// -------------------------------

function sanitizePlaceQuery(q) {
	if (!q || typeof q !== "string") return q;
	// remove parenthetical codes like (BOM), excessive punctuation
	let s = q.replace(/\(.*?\)/g, "");
	// collapse multiple spaces and trim
	s = s.replace(/\s+/g, " ").trim();
	// remove control characters
	s = s.replace(/[\u0000-\u001F\u007F]/g, "");
	// cut overly long queries (Places TextSearch has length limits); keep 200 chars
	if (s.length > 200) s = s.slice(0, 200);
	return s;
}

async function verifyOrCorrectLocation(rawLoc) {
	if (!rawLoc || rawLoc.length < 3) return rawLoc;
	try {
		const query = sanitizePlaceQuery(rawLoc);
		const res = await GetPlaceDetails({ textQuery: query });
		const place = res?.data?.places?.[0];
		if (!place) return rawLoc; // fallback safely
		// Choose displayName + formattedAddress if available, else fallback to place.name
		const name = place.displayName?.text || place.name || "";
		const address =
			place.formattedAddress || place.address?.freeformAddress || "";
		const final = [name, address].filter(Boolean).join(", ");
		return final || rawLoc;
	} catch (err) {
		// Log but do not throw — keep non-breaking
		console.warn(
			"verifyOrCorrectLocation failed for",
			rawLoc,
			err?.message || err
		);
		return rawLoc;
	}
}

async function enhanceItineraryLocations(itinerary) {
	if (!itinerary?.daily_itinerary) return itinerary;
	for (const day of itinerary.daily_itinerary) {
		if (day.accommodation?.location) {
			day.accommodation.location = await verifyOrCorrectLocation(
				day.accommodation.location
			);
		}
		if (Array.isArray(day.activities)) {
			for (const act of day.activities) {
				if (act.location) {
					act.location = await verifyOrCorrectLocation(act.location);
				}
			}
		}
	}
	return itinerary;
}

// -------------------------------
// Prompt: keep the original strict rules, add a strict budget clause
// (This is additive in the prompt; we will still validate budget post-hoc if needed)
// -------------------------------

export default async function getItinerary(formData) {
	const destination =
		typeof formData.destination === "object"
			? formData.destination.label || formData.destination.value?.description
			: formData.destination;

	const from =
		typeof formData.from === "object"
			? formData.from.label || formData.from.value?.description
			: formData.from;

	const prompt = `You are an expert AI travel planner.\nReturn ONLY a valid JSON object, no markdown.\n\nSTRICT RULES FOR ALL LOCATION FIELDS:\n1. Every location MUST be a single, specific, routable Google Maps place.\n2. NEVER output combined or multi-location strings ("A & B", "X or Y").\n3. NEVER output vague, generic, or broad locations such as just "Bangalore" or "MG Road" without a routable address.\n4. EVERY location must include a FULL address structure where possible: name, street/road, area/neighborhood, city, state.\n5. For large parks/palaces/campuses: ALWAYS return the main drivable entry gate or parking address.\n6. Output MUST use the schema EXACTLY as provided below (snake_case keys).\n\nSTRICT BUDGET RULE:\n- The ENTIRE itinerary MUST strictly stay under the user's budget (INR ${
		formData.budget || "UNKNOWN"
	}).\n- If the generated choices exceed budget, choose cheaper options or reduce paid activities so total <= budget.\n\nSCHEMA:\n{\n  "from": "string",\n  "destination": "string",\n  "start_date": "YYYY-MM-DD",\n  "number_of_days": number,\n  "number_of_people": number,\n  "budget_inr": number,\n  "themes": ["string"],\n  "language_preference": "string",\n  "travel_mode_preference": "string",\n  "accommodation_preference": "string",\n  "notes": "string",\n  "daily_itinerary": [\n    {\n      "date": "YYYY-MM-DD",\n      "day_of_week": "string",\n      "theme_focus": "string",\n      "accommodation": { "name":"string","location":"string","notes":"string" },\n      "activities": [ { "time":"HH:MM","category":"string","description":"string","location":"string" } ],\n      "travel": { "mode":"string","details":"string","price_inr": number },\n      "budget_estimate_usd": {"accommodation": number,"food_drinks": number,"transport": number,"miscellaneous": number }\n    }\n  ],\n  "warnings": []\n}\n\nUser Inputs:\nFrom: ${from}\nDestination: ${destination}\nNumber of days: ${
		formData.days
	}\nNumber of people: ${formData.people}\nBudget: ${
		formData.budget
	}\nThemes: ${
		Array.isArray(formData.themes)
			? formData.themes.join(", ")
			: formData.themes
	}\nTravel mode: ${formData.travelMode}\nAccommodation: ${
		formData.accommodation
	}\nStart date: ${formData.startDate}\nLanguage: ${formData.language}`;

	let response;
	try {
		response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});
		// Debug log for development
		console.log("AI raw response:", response);
	} catch (err) {
		console.error("AI error:", err);
		throw err;
	}

	const text = extractText(response);
	const parsed = tryParseJsonFromText(text);

	if (parsed) {
		// Normalize to expected shape (handles camelCase -> snake_case differences)
		const clean = normalizeItinerary(parsed);

		// Non-breaking add-on: verify and correct location strings via Places API
		try {
			const enhanced = await enhanceItineraryLocations(clean);
			// Post-check: ensure budget enforcement (soft check)
			if (typeof enhanced.budget_inr === "number" && enhanced.budget_inr > 0) {
				// If any daily totals appear to exceed budget, add a warning (we avoid heavy changes here)
				// (TODO: implement deeper rebalance if desired)
			}
			return enhanced;
		} catch (err) {
			console.warn(
				"Location enhancement failed — returning cleaned itinerary without enhancement",
				err
			);
			return clean; // still non-breaking
		}
	}

	// Fallback: return minimal normalized structure so UI does not blow up
	return normalizeItinerary({
		from,
		destination,
		start_date: formData.startDate,
		daily_itinerary: [],
	});
}
