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

	const exchangeRate = 89; // USD -> INR

	trip.tripData.daily_itinerary.forEach((day) => {
		const budget = day.budget_estimate_usd || {};
		Object.keys(totals).forEach((key) => {
			totals[key] += Number(budget[key] || 0);
		});
	});

	// Transform totals into chart-friendly data (converted to INR)
	const chartData = Object.entries(totals).map(([key, value]) => ({
		name: key.replace("_", " "),
		value: value * exchangeRate, // only INR
	}));

	// Colors for categories
	const COLORS = [
		"#4F46E5", // accommodation
		"#10B981", // food_drinks
		"#F59E0B", // shopping
		"#EF4444", // nightlife
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

			{/* Grand Total */}
			<div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex justify-between items-center text-white shadow-lg">
				<span className="font-bold text-base">Total Budget</span>
				<span className="font-extrabold text-xl">₹{grandTotal.toLocaleString()}</span>
			</div>
		</section>
	);
}

export default ExpensesBreakdown;
