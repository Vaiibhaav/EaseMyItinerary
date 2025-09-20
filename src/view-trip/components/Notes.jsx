import React from "react";
import { StickyNote } from "lucide-react"; // ✅ modern icon

function Notes({ trip }) {
	const notes = trip?.tripData?.notes;

	return (
		<div className="space-y-4 mt-8">
			{/* Section Heading */}
			<div className="flex items-center gap-2">
				<h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
					<StickyNote className="w-6 h-6 text-primary" />
					Notes
				</h2>
				<div className="flex-grow border-t border-border"></div>
			</div>

			{/* Notes Content */}
			<div className="p-6 rounded-xl bg-accent/20 border border-border shadow-sm">
				{notes ? (
					<p className="text-foreground/90 whitespace-pre-line leading-relaxed text-lg italic">
						“{notes}”
					</p>
				) : (
					<p className="text-muted-foreground text-sm italic">
						No notes added for this trip yet.
					</p>
				)}
			</div>
		</div>
	);
}

export default Notes;
