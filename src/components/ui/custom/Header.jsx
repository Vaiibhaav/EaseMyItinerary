import React, { useEffect, useState } from "react";
import { Button } from "../button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Header() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	const handleLogout = () => {
		googleLogout();
		localStorage.clear();
		setUser(null);
		window.location.href = "/"; // ✅ back to landing page
	};

	// ✅ same login logic as CreateTrip
	const login = useGoogleLogin({
		onSuccess: (tokenResponse) => {
			console.log("Token Response:", tokenResponse);
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
				console.log("Full response:", res);
				localStorage.setItem("user", JSON.stringify(res.data));
				setUser(res.data); // update UI immediately
			})
			.catch((err) => {
				console.error("Error fetching user profile:", err);
				alert("Failed to fetch Google profile. Check console.");
			});
	};

	return (
		<div className="p-3 shadow-sm flex justify-between items-center px-5">
			<img
				src="/logo.svg"
				alt="App Logo"
				className="cursor-pointer w-15 h-auto" // 👈 controls width
				onClick={() => (window.location.href = "/")}
			/>
			<div>
				{user ? (
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							className="rounded-full flex items-center gap-2"
							onClick={() => (window.location.href = "/my-trips")}
						>
							My Trips
						</Button>

						<Popover>
							<PopoverTrigger>
								<img
									src={user.picture}
									alt={user.name}
									className="cursor-pointer w-8 h-8 rounded-full border"
								/>
							</PopoverTrigger>
							<PopoverContent>
								<h2
									className="cursor-pointer text-sm hover:text-red-500"
									onClick={handleLogout}
								>
									Logout
								</h2>
							</PopoverContent>
						</Popover>
					</div>
				) : (
					<Button className="cursor-pointer" onClick={() => login()}>
						Sign In
					</Button>
				)}
			</div>
		</div>
	);
}

export default Header;
