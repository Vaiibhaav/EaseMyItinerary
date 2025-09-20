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
		<header className="fixed top-0 left-0 w-full z-50 bg-background shadow-sm">
			<div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3 text-foreground">
				{/* Logo */}
				<img
					src="/logo.svg"
					alt="App Logo"
					className="cursor-pointer w-10 h-10 object-contain"
					onClick={() => (window.location.href = "/")}
				/>

				{/* Right section */}
				<div>
					{user ? (
						<div className="flex items-center gap-4">
							{/* My Trips button */}
							<Button
								variant="soft"
								className="rounded-full px-5 py-2"
								onClick={() => (window.location.href = "/my-trips")}
							>
								My Trips
							</Button>

							{/* 🎉 Special tab */}
							{isSpecialUser && (
								<Button
									variant="outline"
									className="rounded-full px-5 py-2 border-pink-400 text-pink-500 hover:bg-pink-50"
									onClick={() => (window.location.href = "/special")}
								>
									🌸 Sulochana's Corner 🌸
								</Button>
							)}

							<Popover>
								<PopoverTrigger>
									<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent shadow-sm">
										<img
											src={user.picture}
											alt={user.name}
											className="w-full h-full object-cover"
										/>
									</div>
								</PopoverTrigger>
								<PopoverContent className="bg-card shadow-md rounded-lg p-3">
									<h2
										className="cursor-pointer text-sm text-foreground hover:text-destructive transition"
										onClick={handleLogout}
									>
										Logout
									</h2>
								</PopoverContent>
							</Popover>
						</div>
					) : (
						<Button
							variant="default"
							className="px-6 py-2 rounded-full shadow-sm"
							onClick={() => login()}
						>
							Sign In
						</Button>
					)}
				</div>
			</div>

			{/* 🎊 Special Popup */}
			{showPopup && isSpecialUser && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
					<div className="bg-white rounded-xl shadow-xl p-6 text-center max-w-md">
						<h2 className="text-2xl font-bold text-pink-500 mb-3">
							Welcome! 🎉
						</h2>
						<p className="text-muted-foreground mb-4">
							You’ve unlocked a special section just for you.
						</p>
						<Button
							className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600"
							onClick={() => {
								setShowPopup(false);
								window.location.href = "/special";
							}}
						>
							Let’s Go!
						</Button>
					</div>
				</div>
			)}
		</header>
	);
}

export default Header;
