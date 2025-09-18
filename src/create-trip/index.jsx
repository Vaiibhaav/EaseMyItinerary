// src/create-trip/index.jsx
import React, { useState, useEffect } from "react";
import DestinationInput from "@/components/ui/trip/inputs/DestinationInput";
import DaysInput from "@/components/ui/trip/inputs/DaysInput";
import PeopleInput from "@/components/ui/trip/inputs/PeopleInput";
import BudgetInput from "@/components/ui/trip/inputs/BudgetInput";
import ThemesInput from "@/components/ui/trip/inputs/ThemesInput";
import TimeInput from "@/components/ui/trip/inputs/TimeInput";
import TravelModeInput from "@/components/ui/trip/inputs/TravelModeInput";
import AccommodationInput from "@/components/ui/trip/inputs/AccommodationInput";
import StartDateInput from "@/components/ui/trip/inputs/StartDateInput";
import LanguageInput from "@/components/ui/trip/inputs/LanguageInput";
import { Button } from "@/components/ui/button";
import getItinerary from "@/service/AIModal";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { useNavigate } from "react-router-dom";

const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function CreateTrip() {
	const [formData, setFormData] = useState({
		destination: null,
		days: "",
		people: "",
		budget: "",
		themes: [],
		time: "",
		travelMode: "",
		accommodation: "",
		startDate: "",
		language: "",
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [openDialog, setOpenDialog] = useState(false);

	const navigate = useNavigate();

	const handleInputChange = (name, value) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.destination)
			newErrors.destination = "Destination is required";
		if (
			!formData.days ||
			isNaN(Number(formData.days)) ||
			Number(formData.days) <= 0
		)
			newErrors.days = "Please enter a valid number of days";
		if (
			!formData.people ||
			isNaN(Number(formData.people)) ||
			Number(formData.people) <= 0
		)
			newErrors.people = "Please enter a valid number of people";
		if (
			!formData.budget ||
			isNaN(Number(formData.budget)) ||
			Number(formData.budget) <= 0
		)
			newErrors.budget = "Please enter a valid budget";
		if (!formData.themes || formData.themes.length === 0)
			newErrors.themes = "Select at least one theme";
		if (!formData.time) newErrors.time = "Please select available time";
		if (!formData.travelMode)
			newErrors.travelMode = "Please select travel mode";
		if (!formData.accommodation)
			newErrors.accommodation = "Please select accommodation preference";
		if (!formData.startDate) newErrors.startDate = "Start date is required";
		if (!formData.language)
			newErrors.language = "Please select language preference";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const login = useGoogleLogin({
		onSuccess: (tokenResponse) => {
			console.log("Token Response:", tokenResponse);
			getUserProfile(tokenResponse);
		},
		onError: (error) => console.error("Login Failed:", error),
	});

	const onGenerateTrips = async () => {
		const user = localStorage.getItem("user");

		if (!user) {
			setOpenDialog(true);
			return;
		}

		if (!validateForm()) {
			console.log("Validation failed:", errors);
			return;
		}

		setLoading(true);
		try {
			console.log("Form Data being sent:", formData);
			const result = await getItinerary(formData);
			console.log("Generated Itinerary (raw):", result);

			if (!result) {
				throw new Error(
					"No itinerary returned from AI. Check console for AI raw response."
				);
			}

			// Save and navigate (saveAiTrip normalizes TripData)
			await saveAiTrip(result);
			// note: saveAiTrip navigates on success
		} catch (err) {
			console.error("Error generating itinerary:", err);
			// user-friendly message
			alert(
				"Failed to generate itinerary. See console for details. If this is a server overload, try again in a few minutes."
			);
		} finally {
			setLoading(false);
		}
	};

	const saveAiTrip = async (TripData) => {
		try {
			const docId = Date.now().toString();
			const rawUser = localStorage.getItem("user");
			const user = rawUser ? JSON.parse(rawUser) : null;

			// Normalize TripData:
			// - if it's already an object -> use directly
			// - if it's a string -> try parse, otherwise save as { raw: <string> }
			let tripObj = TripData;
			if (typeof TripData === "string") {
				try {
					tripObj = JSON.parse(TripData);
				} catch (err) {
					console.warn(
						"TripData is a string but not valid JSON. Saving raw string under tripData.raw",
						err
					);
					tripObj = { raw: TripData };
				}
			}

			if (tripObj === null || typeof tripObj !== "object") {
				tripObj = { raw: String(tripObj) };
			}

			await setDoc(doc(db, "AiTrips", docId), {
				userSelection: formData,
				tripData: tripObj,
				userEmail: user?.email ?? null,
				id: docId,
				createdAt: new Date().toISOString(),
			});

			// Navigate after successful save
			navigate(`/view-trip/${docId}`);
		} catch (err) {
			console.error("Error saving AI trip:", err);
			alert("Failed to save itinerary. Check console for details.");
			throw err;
		}
	};

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
				setOpenDialog(false);
				onGenerateTrips();
			})
			.catch((err) => {
				console.error("Error fetching user profile:", err);
				alert("Failed to fetch Google profile. Check console.");
			});
	};

	useEffect(() => {
		console.log("Form data updated:", formData);
	}, [formData]);

	return (
		<div className="flex justify-center mt-10 px-5">
			<div className="w-full max-w-2xl">
				<h2 className="font-bold text-3xl text-center">Customize Your Trip</h2>
				<p className="text-gray-600 mt-2 text-center">
					Fill in your details and let our AI create a personalized itinerary.
				</p>

				<div className="mt-20 mb-20 flex flex-col gap-9">
					<DestinationInput
						value={formData.destination}
						onChange={(v) => handleInputChange("destination", v)}
						apiKey={apiKey}
					/>
					{errors.destination && (
						<p className="text-red-500 text-sm">{errors.destination}</p>
					)}

					<DaysInput
						value={formData.days}
						onChange={(v) => handleInputChange("days", v)}
					/>
					{errors.days && <p className="text-red-500 text-sm">{errors.days}</p>}

					<PeopleInput
						value={formData.people}
						onChange={(v) => handleInputChange("people", v)}
					/>
					{errors.people && (
						<p className="text-red-500 text-sm">{errors.people}</p>
					)}

					<BudgetInput
						value={formData.budget}
						onChange={(v) => handleInputChange("budget", v)}
					/>
					{errors.budget && (
						<p className="text-red-500 text-sm">{errors.budget}</p>
					)}

					<ThemesInput
						value={formData.themes}
						onChange={(v) => handleInputChange("themes", v)}
					/>
					{errors.themes && (
						<p className="text-red-500 text-sm">{errors.themes}</p>
					)}

					<TimeInput
						value={formData.time}
						onChange={(v) => handleInputChange("time", v)}
					/>
					{errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}

					<TravelModeInput
						value={formData.travelMode}
						onChange={(v) => handleInputChange("travelMode", v)}
					/>
					{errors.travelMode && (
						<p className="text-red-500 text-sm">{errors.travelMode}</p>
					)}

					<AccommodationInput
						value={formData.accommodation}
						onChange={(v) => handleInputChange("accommodation", v)}
					/>
					{errors.accommodation && (
						<p className="text-red-500 text-sm">{errors.accommodation}</p>
					)}

					<StartDateInput
						value={formData.startDate}
						onChange={(v) => handleInputChange("startDate", v)}
					/>
					{errors.startDate && (
						<p className="text-red-500 text-sm">{errors.startDate}</p>
					)}

					<LanguageInput
						value={formData.language}
						onChange={(v) => handleInputChange("language", v)}
					/>
					{errors.language && (
						<p className="text-red-500 text-sm">{errors.language}</p>
					)}
				</div>

				<div className="my-10 flex justify-end">
					<Button onClick={onGenerateTrips} disabled={loading}>
						{loading ? "Generating..." : "Generate trip for me"}
					</Button>
				</div>

				{/* We removed inline itinerary rendering — the app now navigates to /view-trip/:id */}
				<Dialog open={openDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogDescription>
								<img
									src="/logo.svg"
									alt="logo"
									className="w-20 h-20 mx-auto mb-4"
								/>
								<h2 className="font-bold text-lg mt-7">Sign in</h2>
								<p>Sign in with Google authentication securely</p>
								<Button
									onClick={login}
									className="w-full mt-5 flex gap-4 items-center justify-center"
								>
									<FcGoogle className="h-7 w-7" />
									Sign in with Google
								</Button>
							</DialogDescription>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

export default CreateTrip;
