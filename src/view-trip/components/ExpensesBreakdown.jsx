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
		shopping: 0,
		nightlife: 0,
		transport: 0,
		miscellaneous: 0,
	};

	const exchangeRate = 83; // USD -> INR

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
		<section className="bg-card rounded-xl p-6 border border-border shadow-md">
			<h2 className="text-2xl font-bold mb-6 text-foreground">
				Expenses Breakdown
			</h2>

			{/* Pie Chart */}
			<div className="w-full h-72 flex items-center justify-center">
				<ResponsiveContainer>
					<PieChart>
						<Pie
							data={chartData}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="50%"
							outerRadius={110}
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
			<div className="mt-6 space-y-2">
				{chartData.map((item, index) => (
					<div
						key={item.name}
						className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded-md"
					>
						<div className="flex items-center gap-2">
							<span
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: COLORS[index % COLORS.length] }}
							></span>
							<span className="capitalize text-foreground">{item.name}</span>
						</div>
						<span className="font-medium text-foreground">
							₹ {item.value.toLocaleString()}
						</span>
					</div>
				))}
			</div>

			{/* Grand Total */}
			<div className="mt-6 p-4 rounded-lg bg-muted/40 flex justify-between items-center font-semibold text-lg text-foreground">
				<span>Total</span>
				<span>₹ {grandTotal.toLocaleString()}</span>
			</div>
		</section>
	);
}

export default ExpensesBreakdown;
