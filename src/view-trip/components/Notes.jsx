import React from "react";

function Notes({ trip }) {
	return (
		<div>
			<h2 className="font-bold text-xl mt-5 mb-3">📝 Notes</h2>
			<p className="text-gray-700 whitespace-pre-line">
				{trip?.tripData?.notes}
			</p>
		</div>
	);
}

export default Notes;
