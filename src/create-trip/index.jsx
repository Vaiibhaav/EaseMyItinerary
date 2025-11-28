// src/create-trip/index.jsx
import React, { useState, useEffect } from "react";
import DestinationInput from "@/components/ui/trip/inputs/DestinationInput";
import DaysInput from "@/components/ui/trip/inputs/DaysInput";
import PeopleInput from "@/components/ui/trip/inputs/PeopleInput";
import BudgetInput from "@/components/ui/trip/inputs/BudgetInput";
import ThemesInput from "@/components/ui/trip/inputs/ThemesInput";
import TravelModeInput from "@/components/ui/trip/inputs/TravelModeInput";
import AccommodationInput from "@/components/ui/trip/inputs/AccommodationInput";
import StartDateInput from "@/components/ui/trip/inputs/StartDateInput";
import LanguageInput from "@/components/ui/trip/inputs/LanguageInput";
import FromLocationInput from "@/components/ui/trip/inputs/FromLocationInput";
import TimeInput from "@/components/ui/trip/inputs/TimeInput";
import { Globe } from "@/components/ui/globe";

import HotelRatingInput from "@/components/ui/trip/inputs/HotelRatingInput";
import HotelAmenitiesInput from "@/components/ui/trip/inputs/HotelAmenitiesInput";
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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SpinnerOverlay } from "@/components/ui/spinner";

const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function CreateTrip() {
	const [formData, setFormData] = useState({
		from: "",
		destination: null,
		days: "",
		people: "",
		budget: "",
		themes: [],
		time: "", // restored global time
		travelMode: "",
		accommodation: "",
		startDate: "",
		language: "",
		hotelRating: "3", // Default to 3 stars
		hotelAmenities: ["AIR_CONDITIONING"], // Default to AIR_CONDITIONING
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
		if (!formData.from) newErrors.from = "Starting location is required";
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

		// restore global time validation
		if (!formData.time) newErrors.time = "Please select available time";

		if (!formData.travelMode)
			newErrors.travelMode = "Please select travel mode";
		if (!formData.accommodation)
			newErrors.accommodation = "Please select accommodation preference";
		if (!formData.startDate) newErrors.startDate = "Start date is required";
		if (!formData.language)
			newErrors.language = "Please select language preference";
		// Hotel rating and amenities have defaults, so they're always valid

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const login = useGoogleLogin({
		onSuccess: (tokenResponse) => {
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
		if (!validateForm()) return;

		setLoading(true);
		try {
			const result = await getItinerary(formData);
			if (!result) throw new Error("No itinerary returned from AI");
			await saveAiTrip(result);
		} catch (err) {
			console.error("Error generating itinerary:", err);
			toast.error("Failed to generate itinerary. Try again in a few minutes.");
		} finally {
			setLoading(false);
		}
	};

	const saveAiTrip = async (TripData) => {
		try {
			const docId = Date.now().toString();
			const rawUser = localStorage.getItem("user");
			const user = rawUser ? JSON.parse(rawUser) : null;

			let tripObj = TripData;

			await setDoc(doc(db, "AiTrips", docId), {
				userSelection: formData,
				tripData: tripObj,
				userEmail: user?.email ?? null,
				id: docId,
				createdAt: new Date().toISOString(),
			});

			navigate(`/view-trip/${docId}`);
		} catch (err) {
			console.error("Error saving AI trip:", err);
			toast.error("Failed to save itinerary.");
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
				localStorage.setItem("user", JSON.stringify(res.data));
				setOpenDialog(false);
				onGenerateTrips();
			})
			.catch(() => {
				toast.error("Failed to fetch Google profile.");
			});
	};

	useEffect(() => {
		console.log("Form data updated:", formData);
	}, [formData]);

	return (
		<div className="flex justify-center mt-10 px-5">
			<div className="w-full max-w-2xl bg-card rounded-xl shadow-md p-8">
				<h2 className="font-bold text-3xl text-center text-foreground">
					Customize Your Trip
				</h2>
				<p className="text-muted-foreground mt-2 text-center">
					Fill in your details and let our AI create a personalized itinerary
				</p>

				<FromLocationInput
					value={formData.from}
					onChange={(v) => handleInputChange("from", v)}
					apiKey={apiKey}
				/>
				{errors.from && <p className="text-red-500 text-sm">{errors.from}</p>}

				<div className="mt-10 mb-12 flex flex-col gap-8">
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

					{/* restored global time input */}
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
					<h2>Pulkit Randua</h2>
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

					<HotelRatingInput
						value={formData.hotelRating}
						onChange={(v) => handleInputChange("hotelRating", v)}
					/>

					<HotelAmenitiesInput
						value={formData.hotelAmenities}
						onChange={(v) => handleInputChange("hotelAmenities", v)}
					/>
				</div>

				<div className="my-8 flex justify-center">
					<Button
						onClick={onGenerateTrips}
						disabled={loading}
						className="px-6 py-2.5 text-base rounded-full bg-[#E67E22] hover:bg-[#D35400] text-white"
					>
						{loading ? "Generating..." : "Generate My Itinerary"}
					</Button>
				</div>
			</div>
			<div className="relative w-full h-[300px] my-4">
				<Globe />
			</div>
			
			{loading && <SpinnerOverlay message="Generating your perfect itinerary..." />}
		</div>
	);
}

export default CreateTrip;
