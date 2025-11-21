// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
	return (
		<footer className="fixed bottom-0 left-0 w-full border-t-2 border-cyan-200/50 bg-white/95 backdrop-blur-md shadow-lg z-50 py-5 px-6">
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
				{/* Left side */}
				<div className="flex items-center gap-3">
					<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-1.5">
						<img
							src="/logo.svg"
							alt="App Logo"
							className="w-5 h-5 cursor-pointer"
							onClick={() => (window.location.href = "/")}
						/>
					</div>
					<span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
						EaseMyItinerary
					</span>
					<span className="hidden md:inline-block text-gray-600 font-medium">
						© {new Date().getFullYear()}
					</span>
				</div>

				{/* Center links */}
				<div className="flex gap-6">
					<a 
						href="/about" 
						className="text-gray-700 font-semibold hover:text-cyan-600 transition-colors hover:scale-110 transform" 
					>
						About
					</a>
					<a 
						href="/contact" 
						className="text-gray-700 font-semibold hover:text-cyan-600 transition-colors hover:scale-110 transform"
					>
						Contact
					</a>
					<a 
						href="/privacy" 
						className="text-gray-700 font-semibold hover:text-cyan-600 transition-colors hover:scale-110 transform"
					>
						Privacy Policy
					</a>
					<a 
						href="/terms" 
						className="text-gray-700 font-semibold hover:text-cyan-600 transition-colors hover:scale-110 transform"
					>
						Terms
					</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
