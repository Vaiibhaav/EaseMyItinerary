import React, { useEffect, useState } from "react";

function Special() {
	const [user, setUser] = useState(null);
	const [checked, setChecked] = useState(false);

	// ✅ Read the allowed user from .env
	const allowedEmail = import.meta.env.VITE_SPECIAL_USER;

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			const parsedUser = JSON.parse(storedUser);

			// ✅ Compare against env email
			if (parsedUser.email === allowedEmail) {
				setUser(parsedUser);
			}
		}
		setChecked(true);
	}, [allowedEmail]);

	if (!checked) {
		return <div className="text-center mt-24">Checking access...</div>;
	}

	if (!user) {
		// 🚫 No access → fake 404
		return (
			<div className="p-10 text-center mt-24">
				<h1 className="text-3xl font-bold text-red-500 mb-4">404</h1>
				<p className="text-lg text-gray-600">This page does not exist.</p>
			</div>
		);
	}

	const name = "Sulochana";

	return (
		<div className="p-10 text-center mt-24 max-w-3xl mx-auto">
			{/* Heading */}
			<h1 className="text-4xl font-extrabold text-pink-500 mb-6">
				🌸 Welcome, {name}! 🌸
			</h1>

			{/* Dedication */}
			<p className="text-muted-foreground text-lg leading-relaxed mb-10">
				This entire project was{" "}
				<span className="font-semibold text-pink-500">
					started and completed
				</span>{" "}
				because of you, {name}. To celebrate that, here’s a{" "}
				<span className="italic font-medium">special tab</span> created just for
				you inside our <span className="font-semibold">EaseMyItinerary</span>.
			</p>

			{/* Ownership Note */}
			<p className="mt-10 text-sm text-muted-foreground italic">
				🌸 This isn’t just another page — it’s your page, {name}. A permanent
				reminder that this journey began and finished because of you. 🌸
			</p>
		</div>
	);
}

export default Special;
