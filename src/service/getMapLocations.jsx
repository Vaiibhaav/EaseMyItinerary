import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
	apiKey: import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY,
});

export default async function getMapLocations(itineraryJson) {
	const prompt = `
You are a strict data formatter.
You will receive a FULL itinerary JSON.
DO NOT modify the content of the itinerary.
DO NOT add extra places.
DO NOT change activity names.
DO NOT invent locations.

Your ONLY job:
Extract every routable location EXACTLY as given in the itinerary,
and return them in this STRICT JSON format:

{
  "day_locations": [
    {
      "day": <number>,
      "accommodation": "string or null",
      "activities": ["string", "string", ...],
      "all_locations": ["acc", "activity1", "activity2"...]  // ordered for routing
    }
  ]
}

RULES:
- ONE location per activity.
- NO vague strings.
- If any location looks incomplete (like “MG Road”), return it EXACTLY — do NOT guess. The UI will verify via Google Places.
- KEEP output short, clean, valid JSON ONLY.

Here is the itinerary:
${JSON.stringify(itineraryJson)}
`;

	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});

		const raw = response.text();
		const cleaned = raw.replace(/```json|```/g, "").trim();
		return JSON.parse(cleaned);
	} catch (err) {
		console.error("MAP LOCATION PARSE ERROR:", err);
		return null;
	}
}
