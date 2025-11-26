import { GoogleGenAI } from "@google/genai";
import { findCheapestHotel, searchFlightOffers, getAirlineNames, getCheckInUrl } from "./AmadeusApi";

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
		// Preserve flight offer data if present
		flightOffer: raw.flightOffer || raw.tripData?.flightOffer || null,
	};

	return normalized;
}

// -----------------------------
// Main Function
// -----------------------------

// Helper function to calculate check-out date
function calculateCheckOutDate(startDate, numberOfDays) {
	const start = new Date(startDate);
	start.setDate(start.getDate() + numberOfDays);
	return start.toISOString().split("T")[0];
}

export default async function getItinerary(formData) {
	const destination =
		typeof formData.destination === "object"
			? formData.destination.label || formData.destination.value?.description
			: formData.destination;

	const from =
		typeof formData.from === "object"
			? formData.from.label || formData.from.value?.description
			: formData.from;

	// 🏨 Step 1: Get hotels from Amadeus API (if not updating existing itinerary)
	let hotelData = null;
	let hotelApiError = null;
	// Use defaults if not provided: 3 stars and AIR_CONDITIONING
	const hotelRating = formData.hotelRating || "3";
	const hotelAmenities = formData.hotelAmenities?.length > 0 
		? formData.hotelAmenities 
		: ["AIR_CONDITIONING"];
	
	// Only proceed if not updating existing itinerary
	if (!formData.additional_prompt && hotelRating && hotelAmenities?.length > 0) {
		const checkInDate = formData.startDate;
		const checkOutDate = calculateCheckOutDate(
			formData.startDate,
			Number(formData.days)
		);

		console.log("🔍 Searching for hotels via Amadeus API...");
		console.log({
			cityName: destination,
			starRating: hotelRating,
			amenities: hotelAmenities,
			checkInDate,
			checkOutDate,
			adults: 2,
		});

		// Call Amadeus API - if this fails, pass empty array to Gemini for web search
		try {
			hotelData = await findCheapestHotel({
				cityName: destination,
				starRating: hotelRating,
				amenities: hotelAmenities,
				checkInDate,
				checkOutDate,
				adults: 2,
			});

			if (!hotelData || !hotelData.hotels || hotelData.hotels.length === 0) {
				hotelApiError = "No hotels found from Amadeus API";
				console.warn("⚠️ No hotels found from Amadeus API, will use web search");
			} else {
				console.log(`✅ Found ${hotelData.hotels.length} hotels via Amadeus`);
			}
		} catch (error) {
			console.error("❌ Error fetching hotels from Amadeus:", error);
			hotelApiError = `Amadeus API error: ${error.message}`;
			console.warn("⚠️ Hotel API failed, will use web search");
		}
	}

	// ✈️ Step 2: Search for flights from Amadeus API (if not updating existing itinerary)
	let flightOffers = null;
	let flightApiError = null;
	const travelMode = formData.travelMode || "";
	const isFlightMode = travelMode.toLowerCase().includes("flight") || travelMode.toLowerCase().includes("air");
	
	if (!formData.additional_prompt && isFlightMode) {
		const departureDate = formData.startDate;
		const numberOfDays = Number(formData.days) || 1;
		const numberOfAdults = Number(formData.people) || 2;
		
		// Calculate return date: departure date + number of days
		const returnDate = calculateCheckOutDate(departureDate, numberOfDays);

		try {
			flightOffers = await searchFlightOffers({
				originCity: from,
				destinationCity: destination,
				departureDate: departureDate,
				returnDate: returnDate,
				adults: numberOfAdults,
			});

			if (!flightOffers || !flightOffers.data || flightOffers.data.length === 0) {
				flightApiError = "No flights found from Amadeus API";
				console.warn("⚠️ No flights found from Amadeus API, will use web search");
			} else {
				console.log(`✅ Found ${flightOffers.data.length} flight offers via Amadeus`);
			}
		} catch (error) {
			console.error("❌ Error fetching flights from Amadeus:", error);
			flightApiError = `Amadeus API error: ${error.message}`;
			console.warn("⚠️ Flight API failed, will use web search");
		}
	}

	// 🧩 New: Allow "update itinerary" via additional_prompt
	const prompt = formData.additional_prompt
		? formData.additional_prompt
		: `
You are an expert AI travel planner.
Return ONLY a valid JSON object, no markdown, no explanations.

The JSON must match this schema exactly:

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
  "flightOffer": { "object": "OPTIONAL - Include the complete selected flight offer JSON from Amadeus API if flights were selected" },
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
      "travel": {
        "mode": "string",
        "details": "string",
        "price_inr": "number"
      },
      "budget_estimate_usd": {
        "accommodation": "number",
        "food_drinks": "number",
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

CRITICAL: NUMBER OF DAYS REQUIREMENT:
- You MUST generate EXACTLY ${formData.days} days in the daily_itinerary array
- The daily_itinerary array MUST have exactly ${formData.days} items, no more, no less
- Each day should be numbered sequentially from Day 1 to Day ${formData.days}
- Calculate dates starting from ${formData.startDate} and increment by 1 day for each subsequent day
- If you cannot create a realistic itinerary for ${formData.days} days, add a warning but still generate exactly ${formData.days} days

${hotelData && hotelData.hotels && hotelData.hotels.length > 0 ? `
🏨 AVAILABLE HOTELS FROM AMADEUS API:
You MUST select ONE hotel from this list that best fits the user's requirements (budget, themes, location, amenities).
Analyze each hotel and choose the most appropriate one based on:
- User's budget: ${formData.budget} INR
- User's themes: ${formData.themes.join(", ")}
- Hotel rating and amenities
- Location convenience for the itinerary

Available Hotels (${hotelData.hotels.length} options):
${hotelData.hotels.map((hotel, idx) => `
${idx + 1}. Name: ${hotel.name}
   Rating: ${hotel.rating || "Not specified"} stars
   Address: ${hotel.address?.fullAddress || hotel.address?.lines?.join(", ") || hotel.address?.cityName || "Address not available"}
   City: ${hotel.address?.cityName || destination}
   Amenities: ${hotel.amenities?.join(", ") || "Not specified"}
   Hotel ID: ${hotel.hotelId}
`).join("")}

CRITICAL HOTEL SELECTION TASK:
1. For each hotel above, search the web to find the current lowest price per night in that country's currency for check-in: ${hotelData.checkIn}
2. Compare prices across booking sites (Booking.com, Agoda, MakeMyTrip, Expedia, Hotels.com, etc.)
3. Select the hotel that BEST matches:
   - User's budget constraints
   - User's themes and preferences
   - Best value for money (price vs amenities vs location)
   - Realistic availability for the dates
4. Use the selected hotel's EXACT name and address in the itinerary for ALL days
5. If NO hotel from the list is suitable or available, search the web for alternative hotels in ${destination} that match the criteria

IMPORTANT: Do NOT guess prices. You MUST search the web and find actual current prices for the specified dates.
` : hotelApiError ? `
⚠️ HOTEL API ISSUE: ${hotelApiError}
Since hotels could not be fetched from the API, you MUST:
1. Search the web for hotels in ${destination} that match:
   - Rating: ${hotelRating} stars
   - Amenities: ${hotelAmenities.join(", ")}
   - Check-in: ${formData.startDate}
   - Budget: ${formData.budget} INR
2. Find real prices from booking sites (Booking.com, Agoda, MakeMyTrip, Expedia, etc.)
3. Select the best hotel that fits the user's budget and preferences
4. Use realistic, actual prices - do NOT estimate
` : `
⚠️ NO HOTEL DATA PROVIDED:
Search the web for hotels in ${destination} that match the user's preferences:
- Rating: ${hotelRating} stars (if specified)
- Check-in: ${formData.startDate}
- Budget: ${formData.budget} INR
- Themes: ${formData.themes.join(", ")}
Find real prices and select the best option.
`}

${flightOffers && flightOffers.data && flightOffers.data.length > 0 && isFlightMode ? `
✈️ AVAILABLE FLIGHTS FROM AMADEUS API:
You MUST select the BEST flight option from this list that fits the user's requirements.
Analyze each flight and choose based on:
- User's budget: ${formData.budget} INR
- Departure/arrival times (consider user's available time: ${formData.time})
- Price vs convenience
- Number of stops (prefer non-stop if available)

Available Flight Offers (${flightOffers.data.length} options):

${flightOffers.data.slice(0, 10).map((offer, idx) => {
	const itineraries = offer.itineraries || [];
	const segments = itineraries[0]?.segments || [];
	const price = offer.price?.total || "Price not available";
	const currency = offer.price?.currency || "USD";
	const departure = segments[0]?.departure?.at || "N/A";
	const arrival = segments[segments.length - 1]?.arrival?.at || "N/A";
	const stops = segments.length - 1;
	return `
OPTION ${idx + 1}:
Summary:
- Price: ${price} ${currency}
- Departure: ${departure}
- Arrival: ${arrival}
- Stops: ${stops}
- Duration: ${offer.itineraries?.[0]?.duration || "N/A"}
- Airline: ${segments[0]?.carrierCode || "N/A"}
- Number of itineraries: ${itineraries.length} (${itineraries.length === 2 ? 'Round trip' : 'One way'})

Full JSON Object (copy this EXACTLY into flightOffer field if you select this option):
${JSON.stringify(offer, null, 2)}
`;
}).join("\n---\n")}

CRITICAL FLIGHT SELECTION TASK:
1. Analyze all flight options above
2. Select the flight that BEST matches:
   - User's budget constraints
   - Convenient departure/arrival times
   - Best value (price vs convenience)
   - Realistic for the itinerary dates
3. CRITICAL: After selecting a flight, you MUST save the COMPLETE flight offer JSON object in the "flightOffer" field at the root level.
   Copy the ENTIRE selected flight offer object EXACTLY as it appears in the list above.
   The flightOffer object MUST include: id, type, source, itineraries (with segments), price, travelerPricings, validatingAirlineCodes, etc.
   Example structure:
   "flightOffer": {
     "type": "flight-offer",
     "id": "1",
     "itineraries": [
       {
         "duration": "PT2H20M",
         "segments": [
           {
             "departure": { "iataCode": "DEL", "terminal": "3", "at": "2025-11-28T08:00:00" },
             "arrival": { "iataCode": "BOM", "terminal": "2", "at": "2025-11-28T10:20:00" },
             "carrierCode": "AI",
             "number": "2435",
             ...
           }
         ]
       },
       {
         "duration": "PT2H10M",
         "segments": [
           {
             "departure": { "iataCode": "BOM", "terminal": "2", "at": "2025-11-30T06:30:00" },
             "arrival": { "iataCode": "DEL", "terminal": "3", "at": "2025-11-30T08:40:00" },
             "carrierCode": "AI",
             "number": "2928",
             ...
           }
         ]
       }
     ],
     "price": { "currency": "INR", "total": "19542.00", ... },
     ...
   }
4. Use the selected flight details in the travel section of Day 1 (for departure) and last day (for return if round trip)
5. Include flight information in travel.details with format:
   "Flight [carrierCode] [number]: [departure.iataCode] [departure.at] - [arrival.iataCode] [arrival.at], Terminal: [departure.terminal]/[arrival.terminal], Duration: [duration]"
6. Set travel.price_inr to the total price from the selected flight offer (price.total)
7. If NO flight from the list is suitable, search the web for alternative flights
` : !isFlightMode ? `
⚠️ TRAVEL MODE: ${formData.travelMode}
Since the user prefers ${formData.travelMode} (not flight), you MUST:
1. Search the web for realistic ${formData.travelMode} options from ${from} to ${destination}
2. Find actual prices and schedules from booking sites (IRCTC, RedBus, MakeMyTrip, etc. depending on mode)
3. Use realistic, current prices - do NOT estimate
4. Include detailed travel information in the travel section
` : flightApiError ? `
⚠️ FLIGHT API ISSUE: ${flightApiError}
Since flights could not be fetched from the API, you MUST:
1. Search the web for flights from ${from} to ${destination}
2. Departure date: ${formData.startDate}
3. Return date: ${calculateCheckOutDate(formData.startDate, Number(formData.days))}
4. Number of passengers: ${formData.people}
5. Find real prices from airline websites and booking sites
6. Select the best flight option that fits the user's budget: ${formData.budget} INR
7. Use realistic, actual prices - do NOT estimate
` : `
⚠️ NO FLIGHT DATA PROVIDED:
Search the web for flights from ${from} to ${destination}:
- Departure: ${formData.startDate}
- Return: ${calculateCheckOutDate(formData.startDate, Number(formData.days))}
- Passengers: ${formData.people}
- Budget: ${formData.budget} INR
Find real prices and select the best option.
`}

CRITICAL INSTRUCTIONS FOR accommodation.notes FIELD:
1. Use the selected hotel's name exactly as provided (from API or web search) in accommodation.name for ALL days
2. Use the hotel's full address in accommodation.location
3. Set accommodation.notes to include ALL of the following in this EXACT format:
   - Price: [currency symbol][price] per night (e.g., "Price: $150 per night" or "Price: ₹5000 per night")
   - Rating: [X] star hotel (e.g., "Rating: 3 star hotel")
   - Amenities: [list separated by commas] (e.g., "Amenities: WiFi, Pool, SPA, AC, Restaurant, Parking")
4. Calculate budget_estimate_usd.accommodation:
   - Take the price per night you found
   - Convert to USD using current exchange rates
   - Store this USD price per night in budget_estimate_usd.accommodation
5. Check-in: ${hotelData?.checkIn || formData.startDate}, Check-out: ${hotelData?.checkOut || calculateCheckOutDate(formData.startDate, Number(formData.days))}
6. Include currency code in accommodation.notes

REALISTIC ITINERARY REQUIREMENTS:
1. The itinerary MUST be realistic and feasible:
   - Travel time between locations must be realistic
   - Activities must fit within available time per day: ${formData.time}
   - Budget allocation must be realistic and within ${formData.budget} INR total
2. If the itinerary is NOT POSSIBLE with the given constraints, you MUST:
   - Set a warning in the "warnings" array explaining why it's not possible
   - Still generate the best possible itinerary with available options
   - Clearly indicate limitations in the notes
3. Budget allocation:
   - Accommodation: Based on selected hotel price × ${formData.days} days
   - Transport: Based on selected flight/travel mode price
   - Food/Drinks: Realistic daily budget for ${formData.people} people
   - Activities: Realistic costs for the themes: ${formData.themes.join(", ")}
   - Activities: Realistic costs for the themes: ${formData.themes.join(", ")}
   - Total must be within or close to ${formData.budget} INR
4. Allocate budget realistically - do NOT overestimate or underestimate costs

Important:
- The itinerary must start from "${from}" and reach "${destination}"
- Include realistic transport details with actual prices from selected flight/travel option
- Ensure each day's itinerary mentions accommodation, transport if needed, and activities
- All textual fields must be written in ${formData.language}
- Only numeric/date fields remain in English/standard formats
- Return ONLY a valid JSON object, no markdown, no explanations
- If itinerary is not feasible, add clear warnings explaining why
`;

	// Call Gemini - it will handle hotel/flight selection and web search fallbacks if needed

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

	const text = extractText(response);
	let parsed = tryParseJsonFromText(text);

	if (parsed) {
		const normalized = normalizeItinerary(parsed);
		
		// Validate and enforce exact number of days
		const requestedDays = Number(formData.days) || 0;
		if (requestedDays > 0 && normalized.daily_itinerary) {
			const currentDays = normalized.daily_itinerary.length;
			if (currentDays !== requestedDays) {
				console.warn(`⚠️ AI generated ${currentDays} days but ${requestedDays} were requested. Adjusting...`);
				
				if (currentDays > requestedDays) {
					// Trim excess days
					normalized.daily_itinerary = normalized.daily_itinerary.slice(0, requestedDays);
				} else if (currentDays < requestedDays) {
					// Add missing days by duplicating and adjusting the last day
					const lastDay = normalized.daily_itinerary[currentDays - 1] || normalized.daily_itinerary[0];
					const startDate = new Date(normalized.start_date || formData.startDate);
					
					for (let i = currentDays; i < requestedDays; i++) {
						const newDate = new Date(startDate);
						newDate.setDate(newDate.getDate() + i);
						const dayOfWeek = newDate.toLocaleDateString('en-US', { weekday: 'long' });
						
						normalized.daily_itinerary.push({
							...lastDay,
							date: newDate.toISOString().split('T')[0],
							day_of_week: dayOfWeek,
							activities: lastDay.activities ? [...lastDay.activities] : [],
							travel: i === requestedDays - 1 ? lastDay.travel : {}, // Only last day has return travel
						});
					}
				}
				normalized.number_of_days = requestedDays;
			}
		}
		
		// Extract price and currency from AI response for budget calculation
		if (normalized?.daily_itinerary && normalized.daily_itinerary.length > 0) {
			const firstDayNotes = normalized.daily_itinerary[0]?.accommodation?.notes || "";
			// Match price with currency: $150, ₹5000, €120, £100, etc.
			const priceMatch = firstDayNotes.match(/(?:Price|price):\s*([$₹€£¥]|USD|INR|EUR|GBP|JPY)?\s*(\d+(?:[.,]\d+)?)\s*per\s*night/i) 
				|| firstDayNotes.match(/(?:Price|price):\s*([$₹€£¥]|USD|INR|EUR|GBP|JPY)?\s*(\d+(?:[.,]\d+)?)/i);
			const hotelPrice = priceMatch ? parseFloat(priceMatch[2].replace(/,/g, '')) : null;
			const currencySymbol = priceMatch?.[1] || null;
			
			// Determine currency code from symbol
			const currencyMap = {
				'$': 'USD',
				'₹': 'INR',
				'€': 'EUR',
				'£': 'GBP',
				'¥': 'JPY',
			};
			const currencyCode = currencySymbol && currencyMap[currencySymbol] 
				? currencyMap[currencySymbol]
				: (currencySymbol && ['USD', 'INR', 'EUR', 'GBP', 'JPY'].includes(currencySymbol.toUpperCase()) 
					? currencySymbol.toUpperCase() 
					: 'USD'); // Default to USD
			
			// Exchange rates (approximate, should be fetched from API in production)
			const exchangeRates = {
				USD: 1,
				INR: 83,
				EUR: 0.92,
				GBP: 0.79,
				JPY: 150,
			};
			
			// Update accommodation cost in budget if price was found
			if (hotelPrice && exchangeRates[currencyCode]) {
				const pricePerNightUSD = hotelPrice / exchangeRates[currencyCode];
				normalized.daily_itinerary = normalized.daily_itinerary.map((day) => ({
					...day,
					budget_estimate_usd: {
						...day.budget_estimate_usd,
						accommodation: pricePerNightUSD, // Price per night in USD
					},
				}));
			}
		}

		// 🏨 Store hotel list from Amadeus API for hotel selection feature
		if (hotelData && hotelData.hotels && hotelData.hotels.length > 0) {
			normalized.availableHotels = {
				hotels: hotelData.hotels,
				checkIn: hotelData.checkIn,
				checkOut: hotelData.checkOut,
				cityCode: hotelData.cityCode,
			};
			console.log("✅ Hotel list saved for hotel selection feature");
		}

		// ✈️ Fetch and save airline names and check-in URLs if flightOffer exists
		if (normalized?.flightOffer && normalized.flightOffer.itineraries) {
			try {
				console.log("🔍 Fetching airline data for flight offer...");
				
				// Extract unique airline codes from all segments
				const airlineCodes = new Set();
				normalized.flightOffer.itineraries.forEach((itinerary) => {
					itinerary.segments?.forEach((segment) => {
						if (segment.carrierCode) {
							airlineCodes.add(segment.carrierCode);
						}
					});
				});

				const uniqueAirlineCodes = Array.from(airlineCodes);
				console.log("Airline codes found:", uniqueAirlineCodes);

				if (uniqueAirlineCodes.length > 0) {
					// Fetch airline names
					const airlineNames = await getAirlineNames(uniqueAirlineCodes);
					console.log("Airline names fetched:", airlineNames);

					// Fetch check-in URLs for each airline
					const checkInUrls = {};
					for (const code of uniqueAirlineCodes) {
						try {
							const url = await getCheckInUrl(code);
							if (url) {
								checkInUrls[code] = url;
							}
						} catch (error) {
							console.warn(`Failed to fetch check-in URL for ${code}:`, error);
						}
					}
					console.log("Check-in URLs fetched:", checkInUrls);
					
					// Save airline data in flightOffer
					normalized.flightOffer.airlineData = {
						airlineNames: airlineNames,
						checkInUrls: checkInUrls,
					};
					console.log("✅ Airline data saved in flightOffer");
				}
			} catch (error) {
				console.error("❌ Error fetching airline data:", error);
				// Don't throw - continue without airline data
			}
		}
		
		return normalized;
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