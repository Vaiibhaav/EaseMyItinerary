import React from "react";
import { StickyNote } from "lucide-react"; // ✅ modern icon

function Notes({ trip }) {
	const notes = trip?.tripData?.notes;

	return (
		<div className="space-y-4">
			{/* Section Heading */}
			<div className="flex items-center gap-3">
				<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2 whitespace-nowrap">
					<StickyNote className="w-5 h-5 text-cyan-600" />
					Notes
				</h2>
				<div className="flex-grow border-t-2 border-cyan-200"></div>
			</div>

			{/* Notes Content */}
			<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-cyan-200/50 p-5">
				{notes ? (
					<p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
						"{notes}"
					</p>
				) : (
					<p className="text-gray-500 text-sm italic">
						No notes added for this trip yet.
					</p>
				)}
			</div>
		</div>
	);
}

export default Notes;
