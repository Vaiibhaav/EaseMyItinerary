import React, { useEffect, useState } from "react";
import { GetPlaceDetails, PHOTO_REF_URL } from "../../service/GlobalApi";
import { Calendar, Users, CheckCircle2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpinnerImage } from "@/components/ui/spinner";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../service/firebaseConfig";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function UserTripCardItem({ trip, onDelete }) {
	const [photoUrl, setPhotoUrl] = useState(null);
	const [imageLoading, setImageLoading] = useState(true);
	const [deleting, setDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		console.log(trip)
		if (trip?.userSelection?.destination?.label || trip.tripData?.destination) {
			getPlaceImage();
		}
		// Reset deleting state when trip changes
		setDeleting(false);
	}, [trip]);

	const getPlaceImage = async () => {
		setImageLoading(true);
		try {
			const data = { textQuery: trip.userSelection.destination?.label || trip.tripData?.destination };
			const res = await GetPlaceDetails(data);
			if (res?.data?.places?.[0]?.photos?.length) {
				const photoRef = res.data.places[0].photos[0].name;
				const url = PHOTO_REF_URL.replace("{NAME}", photoRef);
				setPhotoUrl(url);
			}
		} catch (err) {
			console.error("Error fetching trip image:", err);
		} finally {
			setImageLoading(false);
		}
	};

	const handleViewDetails = () => {
		navigate(`/view-trip/${trip.id}`);
	};

	const handleDeleteClick = (e) => {
		e.stopPropagation(); // Prevent card click event
		setShowDeleteDialog(true);
	};

	const handleConfirmDelete = async () => {
		setShowDeleteDialog(false);
		setDeleting(true);
		try {
			const tripRef = doc(db, "AiTrips", trip.id);
			await deleteDoc(tripRef);
			toast.success("Trip deleted successfully");
			
			// Reset deleting state before notifying parent
			setDeleting(false);
			
			// Notify parent to refresh the list
			if (onDelete) {
				onDelete(trip.id);
			}
		} catch (error) {
			console.error("Error deleting trip:", error);
			toast.error("Failed to delete trip. Please try again.");
			setDeleting(false);
		}
	};

	return (
		<div className="group relative rounded-3xl bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl border-2 border-cyan-200/50 transition-all hover:-translate-y-2 overflow-hidden flex flex-col cursor-pointer"
			// onClick={handleViewDetails}
			>
			{/* Image with Gradient Overlay */}
			<div className="relative overflow-hidden">
				{imageLoading && <SpinnerImage />}
				<img
					src={photoUrl || "/placeholder.jpg"}
					alt={trip?.userSelection?.destination?.label || trip.tripData?.destination}
					className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
					onLoad={() => setImageLoading(false)}
					onError={() => setImageLoading(false)}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
				
				{/* Booking Badge - Top Left */}
				{trip?.isBookingDone && (
					<div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-10">
						<CheckCircle2 className="w-3.5 h-3.5" />
						Booked
					</div>
				)}
				
				{/* Floating Badge */}
				<div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
					{trip?.userSelection?.days} Day Trip
				</div>

				{/* Destination on Image */}
				<div className="absolute bottom-4 left-4 right-4">
					<h3 className="font-extrabold text-2xl text-white drop-shadow-lg line-clamp-2">
						{trip?.userSelection?.destination?.label || trip.tripData?.destination}
					</h3>
				</div>
			</div>

			{/* Content */}
			<div className="p-6 flex flex-col flex-grow">
				{/* Meta Info with Icons */}
				<div className="flex items-center gap-4 mb-4">
					<div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
						<Calendar className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-semibold text-blue-700">
							{trip?.userSelection?.days} Days
						</span>
					</div>
					<div className="flex items-center gap-2 bg-cyan-50 px-3 py-2 rounded-full">
						<Users className="w-4 h-4 text-cyan-600" />
						<span className="text-sm font-semibold text-cyan-700">
							{trip?.userSelection?.people} People
						</span>
					</div>
				</div>

				{/* Budget Info */}
				{trip?.userSelection?.budget && (
					<div className="mb-4">
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
							<span className="text-sm text-gray-600">Budget: </span>
							<span className="text-lg font-bold text-green-700">
								₹{parseInt(trip.userSelection.budget).toLocaleString('en-IN')}
							</span>
						</div>
					</div>
				)}

				{/* Themes/Interests */}
				{trip?.userSelection?.themes && trip.userSelection.themes.length > 0 && (
					<div className="mb-4">
						<div className="flex flex-wrap gap-2">
							{trip.userSelection.themes.slice(0, 3).map((theme, idx) => (
								<span 
									key={idx}
									className="text-xs font-semibold text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200"
								>
									{theme}
								</span>
							))}
							{trip.userSelection.themes.length > 3 && (
								<span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
									+{trip.userSelection.themes.length - 3}
								</span>
							)}
						</div>
					</div>
				)}

				{/* CTA buttons */}
				<div className="mt-auto flex gap-2">
					<button
						onClick={handleViewDetails}
						className="flex-1 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 transform hover:scale-105 flex items-center justify-center gap-2"
					>
						<span>View Itinerary</span>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
					
					{/* Delete button - only show for unbooked trips */}
					{!trip?.isBookingDone && (
						<button
							onClick={handleDeleteClick}
							disabled={deleting}
							className="px-4 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 bg-red-400 hover:bg-red-500 text-white border-0 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
							title="Delete trip"
						>
							{deleting ? (
								<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							) : (
								<Trash2 className="w-4 h-4" />
							)}
						</button>
					)}
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Trip</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this trip? This action cannot be undone and all trip details will be permanently removed.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirmDelete}
							className="bg-red-500 hover:bg-red-600"
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default UserTripCardItem;
