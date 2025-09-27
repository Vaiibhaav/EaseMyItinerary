// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
	return (
		<footer className="fixed bottom-0 left-0 w-full border-t border-border bg-background shadow-sm z-50 py-4 px-6">
			<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
				{/* Left side */}
				<div className="flex items-center gap-2">
					<img
						src="/logo.svg"
						alt="App Logo"
						className="w-6 h-6 cursor-pointer"
						onClick={() => (window.location.href = "/")}
					/>
					<span className="font-semibold text-foreground">EaseMyItinerary</span>
					<span className="hidden md:inline-block">
						© {new Date().getFullYear()}
					</span>
				</div>

				{/* Center links */}
				<div className="flex gap-5">
					<a href="/about" className="hover:text-primary transition-colors" >
						About
					</a>
					<a href="/contact" className="hover:text-primary transition-colors">
						Contact
					</a>
					<a href="/privacy" className="hover:text-primary transition-colors">
						Privacy Policy
					</a>
					<a href="/terms" className="hover:text-primary transition-colors">
						Terms
					</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
