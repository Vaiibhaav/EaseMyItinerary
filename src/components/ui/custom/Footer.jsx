// src/components/layout/Footer.jsx
import React from "react";

function Footer() {
	return (
		<footer className="fixed bottom-0 left-0 w-full border-t py-4 px-6 bg-white shadow-sm z-50">
			<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600">
				{/* Left side */}
				<div className="flex items-center gap-2">
					<img
						src="/logo.svg"
						alt="App Logo"
						className="w-6 h-6 cursor-pointer"
						onClick={() => (window.location.href = "/")}
					/>
					<span className="font-medium">EaseMyItinerary</span>
					<span className="hidden md:inline-block">
						© {new Date().getFullYear()}
					</span>
				</div>

				{/* Center links */}
				<div className="flex gap-4">
					<a href="/about" className="hover:text-black">
						About
					</a>
					<a href="/contact" className="hover:text-black">
						Contact
					</a>
					<a href="/privacy" className="hover:text-black">
						Privacy Policy
					</a>
					<a href="/terms" className="hover:text-black">
						Terms
					</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
