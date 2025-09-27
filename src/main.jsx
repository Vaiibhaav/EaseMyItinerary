import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import React from "react";
import CreateTrip from "./create-trip/index.jsx";
import Header from "./components/ui/custom/Header";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ViewTrip from "./view-trip/[tripId]/index.jsx";
import MyTrips from "./my-trips/index.jsx";
import Footer from "./components/ui/custom/Footer.jsx";
import Special from "./components/ui/custom/Special.jsx";
import About from "./components/ui/custom/About";
import Contact from "./components/ui/custom/Contact";
import PrivacyPolicy from "./components/ui/custom/PrivacyPolicy";
import Terms from "./components/ui/custom/Terms";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/create-trip",
		element: <CreateTrip />,
	},
	{
		path: "/view-trip/:tripId",
		element: <ViewTrip />,
	},
	{
		path: "/my-trips",
		element: <MyTrips />,
	},
	{ path: "/special", element: <Special name="Sulochana" /> },
	{
		path: "/about",
		element: <About />,
	},
	{
		path: "/contact",
		element: <Contact />,
	},
	{
		path: "/privacy",
		element: <PrivacyPolicy />,
	},
	{
		path: "/terms",
		element: <Terms />,
	},
]);

createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
			{/* Header always fixed at top */}
			<Header />

			{/* Routed pages wrapped with bottom padding so footer never overlaps */}
			<div className="pb-20">
				<RouterProvider router={router} />
			</div>

			{/* Footer always fixed at bottom */}
			<Footer />
		</GoogleOAuthProvider>
	</React.StrictMode>
);
