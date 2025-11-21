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

	if (typeof response === "object" && response.tripData) return null;
	if (typeof response.text === "string") return response.text;
	if (typeof response.outputText === "string") return response.outputText;

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

	if (Array.isArray(response.candidates)) {
		return response.candidates
			.map((c) => c.output_text || c.content || JSON.stringify(c))
			.join("\n");
	}

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
		// Try to extract the first {...} block
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

	const normalized = {
		from: raw.from || raw.tripData?.from || "",
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
// Main Function
// -----------------------------

export default async function getItinerary(formData = {}) {
	// Safe defaults to avoid runtime errors
	const safeThemes = Array.isArray(formData.themes) ? formData.themes : [];
	const safeDays = formData.days ?? "";
	const safePeople = formData.people ?? "";
	const safeBudget = formData.budget ?? "";
	const safeTime = formData.time ?? "";
	const safeTravelMode = formData.travelMode ?? "";
	const safeAccommodation = formData.accommodation ?? "";
	const safeStartDate = formData.startDate ?? "";
	const safeLanguage = formData.language ?? "English";

	const from =
		typeof formData.from === "object"
			? formData.from.label || formData.from.value?.description || ""
			: formData.from || "";

	const destination =
		typeof formData.destination === "object"
			? formData.destination.label ||
			  formData.destination.value?.description ||
			  ""
			: formData.destination || "";

	// 🧩 New: Allow "update itinerary" via additional_prompt
	const prompt = formData.additional_prompt
		? formData.additional_prompt
		: `
You are an expert AI travel planner.

The user is currently in "${from}" (starting city).
They want to plan a trip to "${destination}". The itinerary should be for the destination city only.
Return ONLY a valid JSON object — no markdown, no explanations.

The JSON must follow this schema exactly:

{
  "from": "string",
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
      "arrival_summary": "string",
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
      "travel": {
        "mode": "string",
        "details": "string",
        "price_inr": "number"
      },
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
- From: ${from}
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
- The itinerary must start from "${from}" and reach "${destination}".
- Include realistic transport details (flight, cab, train) between the origin and destination with estimated INR cost.
- Ensure each day's itinerary mentions accommodation, transport if needed, and activities.
- All textual fields (description, notes, warnings, accommodation name/location, theme_focus, day_of_week) must be written in ${
				formData.language
		  }.
- Only numeric/date fields remain in English/standard formats.
- Return ONLY a valid JSON object, no markdown, no explanations.
`;

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

	console.debug("AI raw response:", response);

	const text = extractText(response);
	if (!text) {
		// If extractText returned null but response is object, try to use it directly
		if (response && typeof response === "object") {
			// If it already contains a parsed JSON-like shape, normalize and return
			const maybeObj = response.tripData ?? response;
			const normalized = normalizeItinerary(maybeObj);
			if (normalized) return normalized;
		}
	}

	let parsed = null;
	if (text) parsed = tryParseJsonFromText(text);

	if (parsed) {
		const normalized = normalizeItinerary(parsed);
		if (normalized) return normalized;
		// if normalization fails, still return parsed
		return parsed;
	}

	// 🛑 Fallback in case of invalid JSON
	return {
		from,
		destination,
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