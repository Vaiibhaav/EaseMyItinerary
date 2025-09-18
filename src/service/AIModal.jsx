// src/service/AIModal.jsx
import { GoogleGenAI } from "@google/genai";

// INIT
const ai = new GoogleGenAI({
	apiKey: import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY,
});

// -----------------------------
// Utility Functions
// -----------------------------

function extractText(response) {
	if (!response) return "";

	// Structured shape (rare, but handle)
	if (typeof response === "object" && response.tripData) {
		return null;
	}

	if (typeof response.text === "string") return response.text;
	if (typeof response.outputText === "string") return response.outputText;

	// Common Gemini shape
	if (Array.isArray(response.output)) {
		let combined = "";
		for (const block of response.output) {
			if (typeof block.text === "string") combined += block.text;
			if (Array.isArray(block.content)) {
				for (const item of block.content) {
					if (typeof item.text === "string") combined += item.text;
					if (typeof item.output_text === "string")
						combined += item.output_text;
				}
			}
		}
		if (combined.trim()) return combined;
	}

	// Candidates array
	if (Array.isArray(response.candidates)) {
		return response.candidates
			.map((c) => c.output_text || c.content || JSON.stringify(c))
			.join("\n");
	}

	// Fallback
	try {
		return JSON.stringify(response);
	} catch {
		return String(response);
	}
}

function cleanTextForJson(s) {
	if (!s || typeof s !== "string") return s;
	return s
		.replace(/^[\s\n]*```json\s*/i, "")
		.replace(/^[\s\n]*```/i, "")
		.replace(/```[\s\n]*$/i, "")
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
			} catch {
				return null;
			}
		}
		return null;
	}
}

// -----------------------------
// Normalizer
// -----------------------------

function normalizeItinerary(raw) {
	if (!raw || typeof raw !== "object") return null;

	// Base stable schema
	const normalized = {
		destination: raw.destination || raw.tripData?.destination || "",
		start_date: raw.start_date || raw.tripData?.startDate || "",
		number_of_days:
			Number(raw.number_of_days) ||
			Number(raw.tripData?.days) ||
			raw.tripData?.daily_itinerary?.length ||
			0,
		number_of_people:
			Number(raw.number_of_people) || Number(raw.tripData?.people) || 1,
		budget_inr: Number(raw.budget_inr) || Number(raw.tripData?.budget) || null,
		themes: raw.themes || raw.tripData?.themes || [],
		language_preference:
			raw.language_preference || raw.tripData?.language || "English",
		travel_mode_preference:
			raw.travel_mode_preference || raw.tripData?.travelMode || "",
		accommodation_preference:
			raw.accommodation_preference || raw.tripData?.accommodation || "",
		notes: raw.notes || raw.tripData?.notes || "",
		daily_itinerary: raw.daily_itinerary || raw.tripData?.daily_itinerary || [],
		warnings: raw.warnings || [],
	};

	return normalized;
}

// -----------------------------
// Main function
// -----------------------------

export default async function getItinerary(formData) {
	const destination =
		typeof formData.destination === "object"
			? formData.destination.label || formData.destination.value?.description
			: formData.destination;

	const prompt = `
You are an expert AI travel planner.
Return ONLY a valid JSON object, no markdown, no explanations.

The JSON must match this schema exactly:

{
  "destination": "string",
  "start_date": "YYYY-MM-DD",
  "number_of_days": "number",
  "number_of_people": "number",
  "budget_inr": "number",
  "themes": ["string"],
  "language_preference": "string",
  "travel_mode_preference": "string",
  "accommodation_preference": "string",
  "notes": "string",
  "daily_itinerary": [
    {
      "date": "YYYY-MM-DD",
      "day_of_week": "string",
      "theme_focus": "string",
      "accommodation": {
        "name": "string",
        "location": "string",
        "notes": "string"
      },
      "activities": [
        {
          "time": "HH:MM",
          "category": "string",
          "description": "string",
          "location": "string"
        }
      ],
      "budget_estimate_usd": {
        "accommodation": "number",
        "food_drinks": "number",
        "shopping": "number",
        "nightlife": "number",
        "transport": "number",
        "miscellaneous": "number"
      }
    }
  ],
  "warnings": []
}

Inputs:
- Destination: ${destination}
- Number of days: ${formData.days}
- Number of people: ${formData.people}
- Budget (INR): ${formData.budget}
- Themes: ${formData.themes.join(", ")}
- Available time per day: ${formData.time}
- Travel mode preference: ${formData.travelMode}
- Accommodation preference: ${formData.accommodation}
- Start date: ${formData.startDate}
- Language preference: ${formData.language}

Important:
- All textual fields (description, notes, warnings, accommodation name/location, theme_focus, day_of_week) must be written in ${
		formData.language
	}.
- Only numeric/date fields remain in English/standard formats.
- Return ONLY a valid JSON object, no markdown, no explanations.
`;

	// Call AI
	let response;
	try {
		response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});
	} catch (err) {
		console.error("Model call failed:", err);
		throw err;
	}

	console.log("AI raw response:", response);

	// Try extracting
	const text = extractText(response);
	let parsed = tryParseJsonFromText(text);

	// Normalize
	if (parsed) {
		return normalizeItinerary(parsed);
	}

	// Fallback
	return {
		destination: destination,
		start_date: formData.startDate,
		number_of_days: Number(formData.days),
		number_of_people: Number(formData.people),
		budget_inr: Number(formData.budget),
		themes: formData.themes,
		language_preference: formData.language,
		travel_mode_preference: formData.travelMode,
		accommodation_preference: formData.accommodation,
		notes: "Fallback itinerary – AI did not return valid JSON.",
		daily_itinerary: [],
		warnings: ["AI response could not be parsed, fallback schema applied."],
	};
}
