import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function ExpensesBreakdown({ trip }) {
	if (!trip?.tripData?.daily_itinerary?.length) {
		return null; // No expenses available
	}

	// Accumulator for all categories
	const totals = {
		accommodation: 0,
		food_drinks: 0,
		transport: 0,
		miscellaneous: 0,
	};

	// Exchange rates (must match the ones used in booking)
	const exchangeRates = {
		USD: 1,
		INR: 83,
		EUR: 0.92,
		GBP: 0.79,
		JPY: 150,
	};
	const exchangeRate = exchangeRates.INR; // USD -> INR

	// Extract accommodation price per night from first day
	const firstDay = trip.tripData.daily_itinerary[0];
	const firstDayNotes = firstDay?.accommodation?.notes || "";
	// Try to match "per night" pattern first, then fallback to general price pattern
	const priceMatch = firstDayNotes.match(/(?:Price|price):\s*([$₹€£¥]|USD|INR|EUR|GBP|JPY)?\s*(\d+(?:[.,]\d+)?)\s*per\s*night/i) 
		|| firstDayNotes.match(/(?:Price|price):\s*([$₹€£¥]|USD|INR|EUR|GBP|JPY)?\s*(\d+(?:[.,]\d+)?)/i);
	const pricePerNight = priceMatch ? parseFloat(priceMatch[2].replace(/,/g, '')) : null;
	const currencySymbol = priceMatch?.[1] || null;
	
	// Currency map
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
			: 'INR'); // Default to INR

	// Calculate accommodation total: price per night × number of days
	const numberOfDays = trip.tripData.daily_itinerary.length;
	
	if (pricePerNight) {
		// Convert price per night to USD, then multiply by days to get total
		// This matches the booking calculation: pricePerNightINR * numberOfDays
		const pricePerNightUSD = pricePerNight / (exchangeRates[currencyCode] || exchangeRates.INR);
		totals.accommodation = pricePerNightUSD * numberOfDays;
	} else {
		// Fallback: sum from daily itinerary (if price not found in notes)
		// But this should rarely happen if price is properly stored
		trip.tripData.daily_itinerary.forEach((day) => {
			const budget = day.budget_estimate_usd || {};
			totals.accommodation += Number(budget.accommodation || 0);
		});
	}

	// Check if user selected flight mode
	const travelMode = trip?.userSelection?.travelMode || trip?.tripData?.travel_mode_preference || "";
	const isFlightMode = travelMode.toLowerCase().includes("flight") || 
		travelMode.toLowerCase().includes("air") ||
		travelMode.toLowerCase().includes("aeroplane") ||
		travelMode.toLowerCase().includes("plane");

	// Handle flight costs separately
	const flightOffer = trip?.tripData?.flightOffer;
	let flightPriceUSD = 0;
	if (isFlightMode && flightOffer?.price) {
		const flightPrice = parseFloat(flightOffer.price.total || 0);
		const flightCurrency = flightOffer.price.currency || 'INR';
		
		// Convert flight price to USD - this is the ONLY transport cost for flights
		// Use the exact same conversion logic as booking page
		flightPriceUSD = flightPrice / (exchangeRates[flightCurrency] || exchangeRates.INR);
		// Set transport to ONLY the flight price (don't add, just set it)
		totals.transport = flightPriceUSD;
	}

	// Calculate other categories (sum across all days)
	trip.tripData.daily_itinerary.forEach((day) => {
		const budget = day.budget_estimate_usd || {};
		
		// For flight mode: ONLY flight price goes to transport, ALL other transport costs go to miscellaneous
		// For non-flight mode: transport costs go to transport category
		if (isFlightMode) {
			// Flight mode: transport is ONLY the flight price (already set above)
			// Do NOT add any transport from daily budget to transport category
			// Move ALL transport costs from daily budget to miscellaneous
			totals.food_drinks += Number(budget.food_drinks || 0);
			totals.miscellaneous += Number(budget.miscellaneous || 0);
			totals.miscellaneous += Number(budget.transport || 0); // All other transport goes to misc
		} else {
			// Non-flight mode: transport costs go to transport category
			totals.food_drinks += Number(budget.food_drinks || 0);
			totals.transport += Number(budget.transport || 0);
			totals.miscellaneous += Number(budget.miscellaneous || 0);
		}
	});

	// Transform totals into chart-friendly data (converted to INR)
	const chartData = Object.entries(totals).map(([key, value]) => ({
		name: key.replace("_", " "),
		value: value * exchangeRate, // Convert USD to INR
	}));

	// Colors for categories
	const COLORS = [
		"#4F46E5", // accommodation
		"#10B981", // food_drinks
		"#3B82F6", // transport
		"#8B5CF6", // misc
	];

	// Grand total
	const grandTotal = chartData.reduce((a, b) => a + b.value, 0);

	return (
		<section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-cyan-200/50 p-5">
			<div className="flex items-center gap-3 mb-5">
				<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent whitespace-nowrap">
					💰 Expenses
				</h2>
				<div className="flex-grow border-t-2 border-cyan-200"></div>
			</div>

			{/* Pie Chart */}
			<div className="w-full h-56 flex items-center justify-center mb-4">
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={chartData}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="50%"
							outerRadius={85}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip
							formatter={(value, name) => [`₹ ${value.toLocaleString()}`, name]}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>

			{/* Category Breakdown Table */}
			<div className="space-y-2">
				{chartData.map((item, index) => (
					<div
						key={item.name}
						className="flex justify-between items-center text-sm bg-gradient-to-r from-blue-50 to-cyan-50 p-2.5 rounded-lg border border-cyan-100"
					>
						<div className="flex items-center gap-2">
							<span
								className="w-3 h-3 rounded-full shadow-sm"
								style={{ backgroundColor: COLORS[index % COLORS.length] }}
							></span>
							<span className="capitalize text-gray-700 font-medium">{item.name}</span>
						</div>
						<span className="font-bold text-gray-800">
							₹{item.value.toLocaleString()}
						</span>
					</div>
				))}
			</div>

			{/* Amount to be Paid (Accommodation + Transport) */}
			<div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 flex justify-between items-center text-white shadow-lg">
				<span className="font-bold text-base">Amount to be Paid</span>
				<span className="font-extrabold text-xl">
					₹{((totals.accommodation + totals.transport) * exchangeRate).toLocaleString()}
				</span>
			</div>

			{/* Estimated Total Budget */}
			<div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex justify-between items-center text-white shadow-lg">
				<span className="font-bold text-base">Estimated Total Budget</span>
				<span className="font-extrabold text-xl">₹{grandTotal.toLocaleString()}</span>
			</div>
		</section>
	);
}

export default ExpensesBreakdown;
