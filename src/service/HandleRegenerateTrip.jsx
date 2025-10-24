// src/service/handleRegenerateTrip.jsx
import { GoogleGenAI } from "@google/genai";

/**
 * Regenerates a trip itinerary using Gemini based on user-provided changes.
 *
 * @param {Object} tripData - Existing trip itinerary JSON.
 * @param {string} userRequest - The user's text input describing the changes.
 * @returns {Object} - Updated itinerary (parsed JSON object).
 */
export default async function handleRegenerateTrip(tripData, userRequest) {
	if (!tripData || !userRequest) {
		throw new Error("Missing required inputs: tripData or userRequest");
	}

	const ai = new GoogleGenAI({
		apiKey: import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY,
	});

	const prompt = `
You are an expert AI travel planner.

Here is the current itinerary in JSON format:
${JSON.stringify(tripData, null, 2)}

The user has requested the following changes:
"${userRequest}"

Update the itinerary accordingly.
Guidelines:
- Keep JSON schema identical to the original.
- Modify only relevant fields (number_of_days, themes, budget, activities, etc.).
- Ensure valid JSON — no markdown, no explanations.
- Output must start with "{" and end with "}".
`;

	let rawText = "";
	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});

		// Extract text safely from various Gemini response formats
		if (response?.response?.text) rawText = response.response.text();
		else if (response?.outputText) rawText = response.outputText;
		else if (response?.candidates?.[0]?.content?.parts?.[0]?.text)
			rawText = response.candidates[0].content.parts[0].text;

		if (!rawText) throw new Error("Empty response from Gemini.");

		// Clean response to extract pure JSON
		let cleaned = rawText
			.replace(/```json/gi, "")
			.replace(/```/g, "")
			.replace(/^[^{]*/, "") // remove text before first '{'
			.replace(/[^}]*$/, "") // remove text after last '}'
			.trim();

		let parsed;
		try {
			parsed = JSON.parse(cleaned);
		} catch {
			const match = cleaned.match(/(\{[\s\S]*\})/);
			if (match) parsed = JSON.parse(match[1]);
			else throw new Error("Failed to parse JSON from Gemini output.");
		}

		return parsed;
	} catch (err) {
		console.error("Error in handleRegenerateTrip:", err);
		throw new Error("AI returned invalid or unparsable data.");
	}
}
