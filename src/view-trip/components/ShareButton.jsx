import React from "react";

function ShareButton({ tripId, destination }) {
	const handleShare = () => {
		const shareUrl = `${window.location.origin}/view-trip/${tripId}`;
		const shareData = {
			title: `Trip to ${destination || "Destination"}`,
			text: "Check out this amazing trip itinerary I created!",
			url: shareUrl,
		};

		if (navigator.share) {
			navigator
				.share(shareData)
				.catch((err) => console.error("Error sharing trip:", err));
		} else {
			navigator.clipboard.writeText(shareUrl);
			alert("Link copied to clipboard!");
		}
	};

	return (
		<button
			onClick={handleShare}
			className="
        flex items-center gap-2
        px-5 py-3
        border border-border 
        rounded-xl 
        bg-card 
        shadow-sm 
        hover:shadow-md hover:-translate-y-1 
        transition-all cursor-pointer
        whitespace-nowrap
        font-medium text-foreground
      "
		>
			{/* paper plane icon */}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M4 12l16-8-7 16-2-6-7-2z"
				/>
			</svg>
			Share Trip
		</button>
	);
}

export default ShareButton;
