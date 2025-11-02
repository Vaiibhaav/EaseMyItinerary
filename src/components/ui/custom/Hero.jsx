import React, { useState, useEffect } from "react";
import { Button } from "../button";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, MapPin, Calendar, Users } from "lucide-react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import BudgetInput from "../trip/inputs/BudgetInput";
import ThemesInput from "../trip/inputs/ThemesInput";
import TimeInput from "../trip/inputs/TimeInput";
import TravelModeInput from "../trip/inputs/TravelModeInput";
import AccommodationInput from "../trip/inputs/AccommodationInput";
import LanguageInput from "../trip/inputs/LanguageInput";
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
import getItinerary from "@/service/AIModal";

const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

const Hero = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [loading, setLoading] = useState(false);
	const [openDialog, setOpenDialog] = useState(false);

	const [formData, setFormData] = useState({
		from: null,
		destination: null,
		startDate: "",
		days: "",
		people: "",
		budget: "",
		themes: [],
		time: "",
		travelMode: "",
		accommodation: "",
		language: "",
	});

	const [errors, setErrors] = useState({});

	const handleInputChange = (name, value) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error for this field when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.from) newErrors.from = "Starting location is required";
		if (!formData.destination) newErrors.destination = "Destination is required";
		if (!formData.startDate) newErrors.startDate = "Start date is required";
		if (!formData.days || isNaN(Number(formData.days)) || Number(formData.days) <= 0)
			newErrors.days = "Please enter valid number of days";
		if (!formData.people || isNaN(Number(formData.people)) || Number(formData.people) <= 0)
			newErrors.people = "Please enter valid number of people";
		if (!formData.budget || isNaN(Number(formData.budget)) || Number(formData.budget) <= 0)
			newErrors.budget = "Please enter a valid budget";
		if (!formData.themes || formData.themes.length === 0)
			newErrors.themes = "Select at least one theme";
		if (!formData.time) newErrors.time = "Please select available time";
		if (!formData.travelMode) newErrors.travelMode = "Please select travel mode";
		if (!formData.accommodation) newErrors.accommodation = "Please select accommodation";
		if (!formData.language) newErrors.language = "Please select language";

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
		if (!validateForm()) {
			// Scroll to first error or show advanced section if error is there
			if (
				errors.budget ||
				errors.themes ||
				errors.time ||
				errors.travelMode ||
				errors.accommodation ||
				errors.language
			) {
				setShowAdvanced(true);
			}
			return;
		}

		setLoading(true);
		try {
			// Convert from/destination to string format for API
			const tripData = {
				...formData,
				from: formData.from?.label || "",
				destination: formData.destination?.label || "",
			};
			const result = await getItinerary(tripData);
			if (!result) throw new Error("No itinerary returned from AI");

			await saveAiTrip(result, tripData);
		} catch (err) {
			console.error("Error generating itinerary:", err);
			alert("Failed to generate itinerary. Try again in a few minutes.");
		} finally {
			setLoading(false);
		}
	};

	const saveAiTrip = async (TripData, tripData) => {
		try {
			const docId = Date.now().toString();
			const rawUser = localStorage.getItem("user");
			const user = rawUser ? JSON.parse(rawUser) : null;

			let tripObj = TripData;
			if (typeof TripData === "string") {
				try {
					tripObj = JSON.parse(TripData);
				} catch {
					tripObj = { raw: TripData };
				}
			}
			if (tripObj === null || typeof tripObj !== "object") {
				tripObj = { raw: String(tripObj) };
			}

			await setDoc(doc(db, "AiTrips", docId), {
				userSelection: tripData,
				tripData: tripObj,
				userEmail: user?.email ?? null,
				id: docId,
				createdAt: new Date().toISOString(),
			});

			navigate(`/view-trip/${docId}`);
		} catch (err) {
			console.error("Error saving AI trip:", err);
			alert("Failed to save itinerary.");
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
			.catch((err) => {
				console.error("Error fetching user profile:", err);
				alert("Failed to fetch Google profile.");
			});
	};

	return (
		<div className="relative min-h-[90vh] flex items-center justify-center py-16 overflow-hidden w-full">
			{/* Vibrant Gradient Background */}
			<div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-cyan-50"></div>
			
			{/* Animated Background Shapes */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-3xl"></div>
			</div>

			<div className="w-full max-w-7xl mx-auto px-6 relative z-10">
				{/* Hero Heading */}
				<div className="text-center mb-10">
					<h1 className="font-extrabold text-5xl md:text-7xl leading-tight tracking-tight mb-6 mt-3">
						<span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
							{t("AI-Powered Itineraries")}
						</span>
						<br />
						<span className="text-gray-800 font-bold text-3xl md:text-5xl mt-2 block">
							{t("Tailored, Bookable, Instant.")}
						</span>
					</h1>
					<p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mt-6 font-medium">
						{t(
							"Generate end-to-end, optimized itineraries based on budget, time, and interests. Adapt in real time and book everything with one click."
						)}
					</p>
				</div>

				{/* Main Search Card with Button */}
				<div className="relative pb-12">
					<div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-cyan-200/50 p-8 md:p-10 hover:shadow-cyan-200/50 transition-all duration-300 below-padding">
					{/* Primary Search Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
						{/* From Location */}
						<div className="flex flex-col gap-2">
							<label className="text-sm font-bold text-gray-700 flex items-center gap-2">
								<MapPin className="w-5 h-5 text-blue-600" />
								{t("From")}
							</label>
							<div className="rounded-xl border-2 border-blue-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all hover:border-blue-300">
								<GooglePlacesAutocomplete
									apiKey={apiKey}
									selectProps={{
										value: formData.from,
										onChange: (v) => handleInputChange("from", v),
										placeholder: "Starting location...",
										styles: {
											control: (provided) => ({
												...provided,
												backgroundColor: "transparent",
												border: "none",
												boxShadow: "none",
												minHeight: "42px",
												paddingLeft: "6px",
											}),
											input: (provided) => ({
												...provided,
												color: "var(--foreground)",
											}),
											singleValue: (provided) => ({
												...provided,
												color: "var(--foreground)",
												fontWeight: 500,
											}),
											placeholder: (provided) => ({
												...provided,
												color: "var(--muted-foreground)",
											}),
											menu: (provided) => ({
												...provided,
												backgroundColor: "var(--card)",
												border: "1px solid var(--border)",
												borderRadius: "0.5rem",
												zIndex: 50,
											}),
										},
									}}
								/>
							</div>
							{errors.from && <p className="text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-md">{errors.from}</p>}
						</div>

						{/* Destination */}
						<div className="flex flex-col gap-2">
							<label className="text-sm font-bold text-gray-700 flex items-center gap-2">
								<MapPin className="w-5 h-5 text-cyan-600" />
								{t("Destination")}
							</label>
							<div className="rounded-xl border-2 border-cyan-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-cyan-400 focus-within:border-cyan-400 transition-all hover:border-cyan-300">
								<GooglePlacesAutocomplete
									apiKey={apiKey}
									selectProps={{
										value: formData.destination,
										onChange: (v) => handleInputChange("destination", v),
										placeholder: "Where to?",
										styles: {
											control: (provided) => ({
												...provided,
												backgroundColor: "transparent",
												border: "none",
												boxShadow: "none",
												minHeight: "42px",
												paddingLeft: "6px",
											}),
											input: (provided) => ({
												...provided,
												color: "var(--foreground)",
											}),
											singleValue: (provided) => ({
												...provided,
												color: "var(--foreground)",
												fontWeight: 500,
											}),
											placeholder: (provided) => ({
												...provided,
												color: "var(--muted-foreground)",
											}),
											menu: (provided) => ({
												...provided,
												backgroundColor: "var(--card)",
												border: "1px solid var(--border)",
												borderRadius: "0.5rem",
												zIndex: 50,
											}),
										},
									}}
								/>
							</div>
							{errors.destination && (
								<p className="text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-md">{errors.destination}</p>
							)}
						</div>

						{/* Start Date */}
						<div className="flex flex-col gap-2">
							<label className="text-sm font-bold text-gray-700 flex items-center gap-2">
								<Calendar className="w-5 h-5 text-sky-600" />
								{t("Start Date")}
							</label>
							<input
								type="date"
								value={formData.startDate}
								onChange={(e) => handleInputChange("startDate", e.target.value)}
								className="w-full rounded-xl px-4 py-3 bg-white text-gray-800 border-2 border-sky-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all hover:border-sky-300 font-medium [&::-webkit-datetime-edit-text]:text-gray-400 [&::-webkit-datetime-edit-month-field]:text-gray-400 [&::-webkit-datetime-edit-day-field]:text-gray-400 [&::-webkit-datetime-edit-year-field]:text-gray-400"
								style={!formData.startDate ? { color: 'rgb(156, 163, 175)' } : {}}
							/>
							{errors.startDate && (
								<p className="text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-md">{errors.startDate}</p>
							)}
						</div>

						{/* Days & People Combined */}
						<div className="flex flex-col gap-2">
							<label className="text-sm font-bold text-gray-700 flex items-center gap-2">
								<Users className="w-5 h-5 text-cyan-600" />
								{t("Days & Travelers")}
							</label>
							<div className="flex gap-2">
								<input
									type="number"
									placeholder="Days"
									value={formData.days}
									onChange={(e) => handleInputChange("days", e.target.value)}
									className="w-1/2 rounded-xl px-4 py-3 bg-white text-gray-800 border-2 border-cyan-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all hover:border-cyan-300 font-medium placeholder:text-gray-400"
									min="1"
								/>
								<input
									type="number"
									placeholder="People"
									value={formData.people}
									onChange={(e) => handleInputChange("people", e.target.value)}
									className="w-1/2 rounded-xl px-4 py-3 bg-white text-gray-800 border-2 border-cyan-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all hover:border-cyan-300 font-medium placeholder:text-gray-400"
									min="1"
								/>
							</div>
							{(errors.days || errors.people) && (
								<p className="text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-md">
									{errors.days || errors.people}
								</p>
							)}
						</div>
					</div>

					{/* Additional Details Toggle */}
					<button
						onClick={() => setShowAdvanced(!showAdvanced)}
						className="w-full flex items-center justify-center gap-2 py-4 px-6 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 border-2 border-blue-200"
					>
						{showAdvanced ? (
							<>
								<ChevronUp className="w-5 h-5" />
								{t("Hide Additional Details")}
							</>
						) : (
							<>
								<ChevronDown className="w-5 h-5" />
								{t("Show Additional Details")}
							</>
						)}
					</button>

					{/* Additional Details Section */}
					{showAdvanced && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-8 border-t-2 border-blue-200">
							<div>
								<BudgetInput
									value={formData.budget}
									onChange={(v) => handleInputChange("budget", v)}
								/>
								{errors.budget && (
									<p className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-lg mt-1">{errors.budget}</p>
								)}
							</div>

							<div>
								<TimeInput
									value={formData.time}
									onChange={(v) => handleInputChange("time", v)}
								/>
								{errors.time && (
									<p className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-lg mt-1">{errors.time}</p>
								)}
							</div>

							<div>
								<TravelModeInput
									value={formData.travelMode}
									onChange={(v) => handleInputChange("travelMode", v)}
								/>
								{errors.travelMode && (
									<p className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-lg mt-1">{errors.travelMode}</p>
								)}
							</div>

							<div>
								<AccommodationInput
									value={formData.accommodation}
									onChange={(v) => handleInputChange("accommodation", v)}
								/>
								{errors.accommodation && (
									<p className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-lg mt-1">{errors.accommodation}</p>
								)}
							</div>

							<div>
								<LanguageInput
									value={formData.language}
									onChange={(v) => handleInputChange("language", v)}
								/>
								{errors.language && (
									<p className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-lg mt-1">{errors.language}</p>
								)}
							</div>

							<div className="md:col-span-2">
								<ThemesInput
									value={formData.themes}
									onChange={(v) => handleInputChange("themes", v)}
								/>
								{errors.themes && (
									<p className="text-red-600 text-sm font-semibold bg-red-50 px-3 py-1.5 rounded-lg mt-1">{errors.themes}</p>
								)}
							</div>
						</div>
					)}
					</div>

					{/* Search Button - Positioned to overlap the card border */}
					<div className="absolute left-1/2 -translate-x-1/2 -bottom-0 z-10">
						<Button
							onClick={onGenerateTrips}
							disabled={loading}
							size="lg"
							className="px-16 py-7 text-xl rounded-full font-bold shadow-2xl hover:shadow-orange-400/50 transition-all duration-300 bg-[#E67E22] hover:bg-[#D35400] text-white border-0 transform hover:scale-105"
						>
							{loading ? t("Generating...") : t("Generate My Itinerary")}
						</Button>
					</div>
				</div>
			</div>

			{/* Sign-in Dialog */}
			<Dialog open={openDialog} onOpenChange={setOpenDialog}>
				<DialogContent className="bg-white shadow-2xl rounded-3xl border-2 border-cyan-200">
					<DialogHeader>
						<DialogDescription className="text-center">
							<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
								<img src="/logo.svg" alt="logo" className="w-12 h-12" />
							</div>
							<h2 className="font-bold text-2xl mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
								{t("Sign in")}
							</h2>
							<p className="text-gray-600 mb-6 mt-2 font-medium">
								{t("Sign in with Google authentication securely")}
							</p>
							<Button
								onClick={login}
								className="w-full flex gap-3 items-center justify-center rounded-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all"
							>
								<FcGoogle className="h-6 w-6" />
								{t("Continue with Google")}
							</Button>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Hero;
