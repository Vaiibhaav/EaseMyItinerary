import React, { useEffect, useState } from "react";
import { Button } from "../button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

// ✅ Load special emails from .env (comma separated if more than one)
const SPECIAL_EMAIL = import.meta.env.VITE_SPECIAL_USER || "";

function Header() {
	const [user, setUser] = useState(null);
	const [isSpecialUser, setIsSpecialUser] = useState(false);
	const [showPopup, setShowPopup] = useState(false);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			const parsed = JSON.parse(storedUser);
			setUser(parsed);

			if (parsed.email === SPECIAL_EMAIL) {
				setIsSpecialUser(true);
			}

		}
	}, []);

	const handleLogout = () => {
		googleLogout();
		localStorage.clear();
		setUser(null);
		setIsSpecialUser(false);
		setShowPopup(false);
		window.location.href = "/";
	};

	const login = useGoogleLogin({
		onSuccess: (tokenResponse) => {
			getUserProfile(tokenResponse);
		},
		onError: (error) => console.error("Login Failed:", error),
	});

	const getUserProfile = (tokenInfo) => {
		axios
			.get(
				`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokenInfo.access_token}`,
				{
					headers: {
						Authorization: `Bearer ${tokenInfo.access_token}`,
						Accept: "application/json",
					},
				}
			)
			.then((res) => {
				localStorage.setItem("user", JSON.stringify(res.data));
				setUser(res.data);

				if (res.data.email === SPECIAL_EMAIL) {
					setIsSpecialUser(true);
					setShowPopup(true);
				}
			})
			.catch((err) => {
				console.error("Error fetching user profile:", err);
				alert("Failed to fetch Google profile. Check console.");
			});
	};

	return (
		<header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-lg border-b-2 border-cyan-200/50">
			<div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
				{/* Logo with gradient background */}
				<div 
					className="cursor-pointer flex items-center gap-2 group"
					onClick={() => (window.location.href = "/")}
				>
					<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-2 group-hover:scale-110 transition-transform">
						<img
							src="/logo.svg"
							alt="App Logo"
							className="w-7 h-7 object-contain"
						/>
					</div>
					<span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent hidden md:inline">
						EaseMyItinerary
					</span>
				</div>

				{/* Right section */}
				<div>
					{user ? (
						<div className="flex items-center gap-3">
							{/* Special tab */}
							{isSpecialUser && (
								<Button
									className="rounded-full px-5 py-2 border-2 border-pink-400 text-pink-600 bg-pink-50 hover:bg-pink-100 font-semibold transition-all"
									onClick={() => (window.location.href = "/special")}
								>
									🌸 Sulochana's Corner 🌸
								</Button>
							)}

							<Popover>
								<PopoverTrigger>
									<div className="relative group">
										<div className="w-11 h-11 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center border-2 border-cyan-400 hover:border-cyan-500 group-hover:scale-105 transform">
											<span className="text-white font-extrabold text-lg uppercase select-none">
												{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
											</span>
										</div>
									</div>
								</PopoverTrigger>
								<PopoverContent className="bg-white shadow-2xl rounded-xl p-4 border-2 border-cyan-200 min-w-[240px]">
									<div className="flex flex-col gap-3">
										<div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm border-2 border-cyan-300">
												<span className="text-white font-extrabold text-lg select-none">
													{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-bold text-gray-800 text-sm truncate">{user.name}</p>
												<p className="text-xs text-gray-500 truncate">{user.email}</p>
											</div>
										</div>
										
										{/* My Trips Button */}
										<button
											className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 py-2.5 px-4 rounded-lg transition-all text-center flex items-center justify-center gap-2 border-2 border-blue-200 hover:border-transparent"
											onClick={() => (window.location.href = "/my-trips")}
										>
											<span>My Trips</span>
										</button>

										{/* Logout Button */}
										<button
											className="cursor-pointer text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 py-2.5 px-4 rounded-lg transition-all text-center flex items-center justify-center gap-2 border-2 border-red-200 hover:border-red-600"
											onClick={handleLogout}
										>
											<span>Logout</span>
										</button>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					) : (
						<Button
							className="px-8 py-2.5 rounded-full shadow-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 hover:shadow-xl transition-all"
							onClick={() => login()}
						>
							Sign In
						</Button>
					)}
				</div>
			</div>

			{/* 🎊 Special Popup */}
			{showPopup && isSpecialUser && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
					<div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md border-2 border-pink-200">
						<div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
							<span className="text-4xl">🎉</span>
						</div>
						<h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
							Welcome! 
						</h2>
						<p className="text-gray-600 mb-6 font-medium">
							You've unlocked a special section just for you.
						</p>
						<Button
							className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
							onClick={() => {
								setShowPopup(false);
								window.location.href = "/special";
							}}
						>
							Let's Go!
						</Button>
					</div>
				</div>
			)}
		</header>
	);
}

export default Header;
