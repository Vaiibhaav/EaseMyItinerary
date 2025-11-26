import axios from "axios";

// Amadeus API base URLs
const AMADEUS_BASE_URL = "https://test.api.amadeus.com";
const AMADEUS_TOKEN_URL = `${AMADEUS_BASE_URL}/v1/security/oauth2/token`;

// Get Amadeus access token
async function getAmadeusToken() {
	try {
		const response = await axios.post(
			AMADEUS_TOKEN_URL,
			new URLSearchParams({
				grant_type: "client_credentials",
				client_id: import.meta.env.VITE_AMADEUS_CLIENT_ID,
				client_secret: import.meta.env.VITE_AMADEUS_CLIENT_SECRET,
			}),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);
		return response.data.access_token;
	} catch (error) {
		console.error("Error getting Amadeus token:", error);
		throw new Error("Failed to authenticate with Amadeus API");
	}
}

// Get city code from city name (using Amadeus Airport & City Search)
async function getCityCode(cityName, accessToken) {
	try {
		// Extract first word from city name for keyword search
		const firstWord = cityName.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, "");
		
		const response = await axios.get(
			`${AMADEUS_BASE_URL}/v1/reference-data/locations`,
			{
				params: {
					keyword: firstWord,
					subType: "CITY",
				},
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		if (response.data?.data && response.data.data.length > 0) {
			// Try to find exact match first, then fallback to first result
			const exactMatch = response.data.data.find(
				(loc) => loc.name?.toLowerCase().includes(cityName.toLowerCase())
			);
			const location = exactMatch || response.data.data[0];
			return {
				iataCode: location.iataCode,
				countryCode: location.address?.countryCode || null,
			};
		}
		return null;
	} catch (error) {
		console.error("Error getting city code:", error.response?.data || error.message);
		return null;
	}
}

// Map country code to currency code
function getCurrencyFromCountryCode(countryCode) {
	const countryToCurrency = {
		US: "USD",
		GB: "GBP",
		IN: "INR",
		AU: "AUD",
		CA: "CAD",
		DE: "EUR",
		FR: "EUR",
		IT: "EUR",
		ES: "EUR",
		NL: "EUR",
		BE: "EUR",
		AT: "EUR",
		PT: "EUR",
		IE: "EUR",
		FI: "EUR",
		GR: "EUR",
		JP: "JPY",
		CN: "CNY",
		KR: "KRW",
		SG: "SGD",
		MY: "MYR",
		TH: "THB",
		ID: "IDR",
		PH: "PHP",
		VN: "VND",
		NZ: "NZD",
		ZA: "ZAR",
		BR: "BRL",
		MX: "MXN",
		AR: "ARS",
		CL: "CLP",
		AE: "AED",
		SA: "SAR",
		TR: "TRY",
		RU: "RUB",
		PL: "PLN",
		SE: "SEK",
		NO: "NOK",
		DK: "DKK",
		CH: "CHF",
		HK: "HKD",
		TW: "TWD",
	};
	return countryToCurrency[countryCode] || "USD"; // Default to USD if country not found
}

// Map our amenity codes to Amadeus API values
function mapAmenitiesToAmadeus(amenities) {
	const amenityMap = {
		SWIMMING_POOL: "SWIMMING_POOL",
		SPA: "SPA",
		FITNESS_CENTER: "FITNESS_CENTER",
		AIR_CONDITIONING: "AIR_CONDITIONING",
		RESTAURANT: "RESTAURANT",
		PARKING: "PARKING",
		WIFI: "WIFI",
		MEETING_ROOMS: "MEETING_ROOMS",
		VALET_PARKING: "VALET_PARKING",
		BAR_OR_LOUNGE: "BAR or LOUNGE", // Amadeus API uses "BAR or LOUNGE" (with space and "or")
		TELEVISION: "TELEVISION",
		ROOM_SERVICE: "ROOM_SERVICE",
		GUARDED_PARKING: "GUARDED_PARKG", // Amadeus API uses "GUARDED_PARKG" (abbreviated)
	};

	return amenities
		.map((amenity) => amenityMap[amenity])
		.filter((amenity) => amenity !== undefined);
}

// Get hotels by city
async function getHotelsByCity(cityCode, starRating, amenities, accessToken) {
	try {
		// Build query string manually to avoid axios array bracket notation (ratings[] -> ratings)
		const queryParams = new URLSearchParams();
		queryParams.append('cityCode', cityCode);

		// Add ratings parameter if provided (Amadeus expects multiple ratings as separate params)
		if (starRating) {
			queryParams.append('ratings', starRating);
		}

		// Add amenities parameter if provided (Amadeus expects multiple amenities as separate params)
		if (amenities && amenities.length > 0) {
			const mappedAmenities = mapAmenitiesToAmadeus(amenities);
			mappedAmenities.forEach((amenity) => {
				queryParams.append('amenities', amenity);
			});
		}

		const response = await axios.get(
			`${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?${queryParams.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		if (!response.data?.data) {
			return [];
		}
		
		const hotels = response.data.data;
		
		// Return first 10 hotels to check availability
		return hotels.slice(0, 10);
	} catch (error) {
		console.error("Error getting hotels by city:", error.response?.data || error.message);
		return [];
	}
}

// Search hotel offers (availability and pricing) for multiple hotels
async function searchHotelOffers(
	hotelIds, // Array of hotel IDs
	checkInDate,
	checkOutDate,
	adults,
	amenities,
	accessToken
) {
	try {
		// Build query params manually to handle array properly
		const queryParams = new URLSearchParams();
		
		// Add hotel IDs - Amadeus expects comma-separated or multiple params
		// Using comma-separated string format
		queryParams.append('hotelIds', hotelIds.join(','));
		queryParams.append('adults', adults || 2);
		queryParams.append('checkInDate', checkInDate);
		queryParams.append('checkOutDate', checkOutDate);

		const response = await axios.get(
			`${AMADEUS_BASE_URL}/v3/shopping/hotel-offers?${queryParams.toString()}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.data?.data || response.data.data.length === 0) {
			return [];
		}

		// Process all hotels from the response
		const hotelOffers = response.data.data.map((hotelData) => {
			// Check if hotel has offers
			if (!hotelData.offers || hotelData.offers.length === 0) {
				return null;
			}

			const offers = hotelData.offers;

			// Filter offers that are available (have price)
			const availableOffers = offers.filter((offer) => {
				// Check if offer is available (has price)
				if (!offer.price || !offer.price.total) {
					return false;
				}
				// Check if offer is available (not sold out)
				if (offer.self === false) {
					return false;
				}
				return true;
			});

			if (availableOffers.length === 0) {
				return null;
			}

			// Get the cheapest offer for this hotel
			const cheapestOffer = availableOffers.reduce((min, offer) => {
				const minPrice = parseFloat(min.price.total) || Infinity;
				const offerPrice = parseFloat(offer.price.total) || Infinity;
				return offerPrice < minPrice ? offer : min;
			}, availableOffers[0]);

			// Extract hotel information
			const hotelInfo = hotelData.hotel || {};
			
			return {
				hotelId: hotelInfo.hotelId,
				name: hotelInfo.name || "Hotel",
				rating: hotelInfo.rating || hotelInfo.hotelRating || null,
				address: hotelInfo.address || {},
				amenities: hotelInfo.amenities || [],
				available: true,
				price: cheapestOffer.price.total,
				currency: cheapestOffer.price.currency || "USD",
				offerId: cheapestOffer.id,
				checkIn: checkInDate,
				checkOut: checkOutDate,
			};
		});

		// Filter out null results (hotels with no available offers)
		return hotelOffers.filter((offer) => offer !== null);
	} catch (error) {
		console.error(`Error searching hotel offers for hotels:`, error.response?.data || error.message);
		return [];
	}
}

// Main function to find cheapest available hotel
export async function findCheapestHotel({
	cityName,
	starRating,
	amenities,
	checkInDate,
	checkOutDate,
	adults = 2,
}) {
	try {
		// Step 1: Get access token via OAuth
		const accessToken = await getAmadeusToken();
		
		// Step 2: Get city code
		const cityData = await getCityCode(cityName, accessToken);
		if (!cityData || !cityData.iataCode) {
			throw new Error(`Could not find city code for: ${cityName}`);
		}
		const cityCode = cityData.iataCode;

		// Step 3: Get hotels by city (first 10)
		const hotels = await getHotelsByCity(
			cityCode,
			starRating,
			amenities,
			accessToken
		);

		if (hotels.length === 0) {
			throw new Error("No hotels found for the specified criteria");
		}

        // Step 4: Search offers for all hotels in a single API call
        // const hotelIds = hotels.map((hotel) => hotel.hotelId);
        // const availableHotels = await searchHotelOffers(
        //     hotelIds,
        //     checkInDate,
        //     checkOutDate,
        //     adults,
        //     amenities,
        //     accessToken
        // );
        
        // if (availableHotels.length === 0) {
        //     throw new Error("No available hotels found for the specified dates");
        // }

        // // Step 5: Find cheapest hotel
        // const cheapestHotel = availableHotels.reduce((min, hotel) => {
        //     const minPrice = parseFloat(min.price) || Infinity;
        //     const hotelPrice = parseFloat(hotel.price) || Infinity;
        //     return hotelPrice < minPrice ? hotel : min;
        // }, availableHotels[0]);

        // return cheapestHotel;

		// Step 4: Extract hotel information (skip searchHotelOffers API call for now)
		// Return all hotels with basic info - Gemini will select the best one and fetch prices from web
		// Map all hotels to include name, address, rating, and amenities
		const hotelList = hotels.map((hotel) => {
			// Extract hotel name and address from Amadeus response
			const hotelName = hotel.name;
			const hotelAddress = hotel.address || {};
			const addressLines = hotelAddress.lines || [];
			const cityNameFromHotel = hotelAddress.cityName;
			const hotelRating = hotel.hotelRating || starRating || null;
			const hotelAmenities = hotel.amenities || amenities || [];
			
			return {
				hotelId: hotel.hotelId,
				name: hotelName,
				rating: hotelRating,
				address: {
					lines: addressLines,
					cityName: cityNameFromHotel,
					countryCode: hotelAddress.countryCode || "",
					fullAddress: addressLines.length > 0 
						? `${addressLines.join(", ")}, ${cityNameFromHotel}`
						: cityNameFromHotel,
				},
				amenities: hotelAmenities,
			};
		});
		
		// Return all hotels for Gemini to choose from
		return {
			hotels: hotelList,
			checkIn: checkInDate,
			checkOut: checkOutDate,
			cityCode: cityCode, // Store city code for later use
		};
	} catch (error) {
		console.error("Error finding cheapest hotel:", error);
		throw error;
	}
}

// Search flight offers
export async function searchFlightOffers({
	originCity,
	destinationCity,
	departureDate,
	returnDate, // Required: calculated as departureDate + numberOfDays
	adults = 2,
}) {
	try {
		// Step 1: Get access token via OAuth
		const accessToken = await getAmadeusToken();
		
		// Step 2: Get city codes for origin and destination
		console.log("🔍 Getting city codes for flight search...");
		const originCityData = await getCityCode(originCity, accessToken);
		if (!originCityData || !originCityData.iataCode) {
			throw new Error(`Could not find city code for origin: ${originCity}`);
		}
		const originLocationCode = originCityData.iataCode;
		const originCountryCode = originCityData.countryCode;
		
		const destinationCityData = await getCityCode(destinationCity, accessToken);
		if (!destinationCityData || !destinationCityData.iataCode) {
			throw new Error(`Could not find city code for destination: ${destinationCity}`);
		}
		const destinationLocationCode = destinationCityData.iataCode;

		console.log(`✅ City codes found - Origin: ${originLocationCode}, Destination: ${destinationLocationCode}`);

		// Step 3: Determine currency based on origin country
		const currency = getCurrencyFromCountryCode(originCountryCode);
		console.log(`💰 Currency determined: ${currency} (based on country: ${originCountryCode})`);

		// Step 4: Search for flight offers
		console.log("✈️ Searching for flight offers via Amadeus API...");
		const params = {
			originLocationCode: originLocationCode,
			destinationLocationCode: destinationLocationCode,
			departureDate: departureDate,
			returnDate: returnDate, // Always include returnDate (calculated from departureDate + numberOfDays)
			adults: adults,
			travelClass: "ECONOMY",
			nonStop: true,
			currencyCode: currency,
		};

		console.log("Flight search parameters:", params);

		const response = await axios.get(
			`${AMADEUS_BASE_URL}/v2/shopping/flight-offers`,
			{
				params: params,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		console.log("✅ Flight offers response:", JSON.stringify(response.data, null, 2));
		
		return response.data;
	} catch (error) {
		console.error("❌ Error searching flight offers:", error.response?.data || error.message);
		throw error;
	}
}

// Get airline names from airline codes
export async function getAirlineNames(airlineCodes) {
	try {
		if (!airlineCodes || airlineCodes.length === 0) {
			return {};
		}

		// Get access token
		const accessToken = await getAmadeusToken();
		
		// Amadeus API expects comma-separated airline codes
		const codesString = Array.isArray(airlineCodes) 
			? airlineCodes.join(',') 
			: airlineCodes;

		const response = await axios.get(
			`${AMADEUS_BASE_URL}/v1/reference-data/airlines`,
			{
				params: {
					airlineCodes: codesString,
				},
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		// Map airline codes to names
		const airlineMap = {};
		if (response.data?.data) {
			response.data.data.forEach((airline) => {
				if (airline.iataCode && airline.businessName) {
					airlineMap[airline.iataCode] = airline.businessName;
				}
			});
		}

		return airlineMap;
	} catch (error) {
		console.error("Error getting airline names:", error.response?.data || error.message);
		return {};
	}
}

// Get check-in URL for an airline
export async function getCheckInUrl(airlineCode) {
	try {
		if (!airlineCode) {
			return null;
		}

		// Get access token
		const accessToken = await getAmadeusToken();

		const response = await axios.get(
			`${AMADEUS_BASE_URL}/v2/reference-data/urls/checkin-links`,
			{
				params: {
					airlineCode: airlineCode,
				},
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		// Extract check-in URL from response
		// Filter for channel 'All' and get its href
		if (response.data?.data && Array.isArray(response.data.data)) {
			const allChannelLink = response.data.data.find(
				(link) => link.channel === 'All'
			);
			
			if (allChannelLink && allChannelLink.href) {
				return allChannelLink.href;
			}
			
			// Fallback to first link if 'All' channel not found
			if (response.data.data.length > 0 && response.data.data[0].href) {
				return response.data.data[0].href;
			}
		}

		return null;
	} catch (error) {
		console.error("Error getting check-in URL:", error.response?.data || error.message);
		return null;
	}
}

