import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Sparkles, Plane, Hotel, MapPin, Star, Phone, Clock, Calendar } from "lucide-react";

const ai = new GoogleGenAI({
	apiKey: import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY,
});

export default function TravelChatBot() {
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content: "👋 Hello! I'm your AI travel assistant. I can help you find flights, hotels, and plan your perfect trip. How can I assist you today?",
		},
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [sessionId, setSessionId] = useState(null);
	const [sessionTime, setSessionTime] = useState(null);
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	//move to env
	const MCP_AGENT_URL =
		"https://booking-service2-1016136679747.us-central1.run.app/run_sse";
	const SESSION_API_URL =
		"https://booking-service2-1016136679747.us-central1.run.app/apps/booking-app2/users/user/sessions";

	// --------------------------------------------------
	// 🔄 Session Management
	// --------------------------------------------------
	async function getNewSession() {
		try {
			const res = await fetch(SESSION_API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			if (data?.id) {
				setSessionId(data.id);
				setSessionTime(Date.now());
				console.log("🆕 New session:", data.id);
				return data.id;
			}
		} catch (err) {
			console.error("Session error:", err);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "⚠️ Couldn't create a session. Please retry.",
				},
			]);
		}
		return null;
	}

	useEffect(() => {
		if (!sessionTime) return;
		const interval = setInterval(async () => {
			if (Date.now() - sessionTime > 30 * 60 * 1000) await getNewSession();
		}, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, [sessionTime]);

	// --------------------------------------------------
	// 🚀 Handle User Send
	// --------------------------------------------------
	async function handleSend() {
		if (!input.trim()) return;
		setLoading(true);

		const userMessage = input;
		const newMessages = [...messages, { role: "user", content: userMessage }];
		setMessages(newMessages);
		setInput("");

		try {
			let activeSession = sessionId;
			if (!activeSession) {
				activeSession = await getNewSession();
				if (!activeSession) throw new Error("Session unavailable");
			}

			const prompt = `
You are a travel assistant.
If the user's query relates to hotels, flights, itineraries, or bookings,
respond ONLY with:
{ "action": "call_mcp_agent", "query": "<user query>" }
Otherwise, answer naturally.

User: "${userMessage}"
`;

			const geminiResp = await ai.models.generateContent({
				model: "gemini-2.5-flash",
				contents: [{ role: "user", parts: [{ text: prompt }] }],
			});
			const text = extractText(geminiResp);
			const maybeJson = tryParseJsonFromText(text);

			if (maybeJson?.action === "call_mcp_agent") {
				const agentResp = await fetch(MCP_AGENT_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						sessionId: activeSession,
						userId: "user",
						appName: "booking-app2",
						newMessage: { role: "user", parts: [{ text: maybeJson.query }] },
						model: "gemini-2.5-flash",
						stream: false,
					}),
				});

				const agentText = await agentResp.text();
				const combined = extractCombinedJson(agentText);
				const formatted = formatAgentResponse(combined);

				setMessages([
					...newMessages,
					{ role: "assistant", content: formatted, isStructured: true },
				]);
			} else {
				setMessages([
					...newMessages,
					{ role: "assistant", content: text || "No response" },
				]);
			}
		} catch (err) {
			console.error(err);
			setMessages([
				...newMessages,
				{ role: "assistant", content: " " + err.message },
			]);
		}
		setLoading(false);
	}

	// --------------------------------------------------
	// 🧰 Helper Functions
	// --------------------------------------------------
	function extractText(resp) {
		if (!resp) return "";
		const c = resp.candidates?.[0];
		if (c?.output_text) return c.output_text;
		if (c?.content?.parts?.length)
			return c.content.parts.map((p) => p.text || JSON.stringify(p)).join("\n");
		return JSON.stringify(resp);
	}

	function tryParseJsonFromText(text) {
		try {
			return JSON.parse(text);
		} catch {
			const match = text.match(/(\[.*\]|\{[\s\S]*\})/);
			if (match) {
				try {
					return JSON.parse(match[1]);
				} catch {
					return null;
				}
			}
			return null;
		}
	}

	// 🧩 Combines multiple "data:" SSE messages into one JSON blob
	function extractCombinedJson(raw) {
		try {
			let chunks = raw
				.split("\n")
				.filter((line) => line.startsWith("{") || line.startsWith("data:"))
				.map((l) => l.replace("data: ", "").trim());

			return chunks
				.map((chunk) => {
					try {
						return JSON.parse(chunk);
					} catch {
						return null;
					}
				})
				.filter(Boolean);
		} catch (e) {
			console.error("Parse combined JSON error:", e);
			return [];
		}
	}

	// --------------------------------------------------
	// 💅 Smart Renderer
	// --------------------------------------------------
	function formatAgentResponse(chunks) {
		if (!Array.isArray(chunks) || !chunks.length)
			return <pre>⚠️ No structured data found</pre>;

		// find functionResponse
		const funcResp = chunks.find(
			(c) => c.content?.parts?.[0]?.functionResponse
		);
		const textPart = chunks.find((c) => c.content?.parts?.some((p) => p.text));

		let structuredResult;
		if (funcResp) {
			const result = funcResp.content.parts[0].functionResponse.response.result;
			structuredResult = tryParseJsonFromText(result);
		}

		// Render Hotels
		if (Array.isArray(structuredResult) && structuredResult[0]?.city) {
			return (
				<div className="grid grid-cols-1 gap-3 mt-2">
					{structuredResult.map((h, i) => (
						<div
							key={i}
							className="bg-white/95 backdrop-blur-sm border-2 border-cyan-200/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-cyan-300"
						>
							<div className="flex items-start gap-3 mb-3">
								<div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full p-2.5 flex-shrink-0">
									<Hotel className="w-5 h-5 text-cyan-600" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
										{h.name}
									</h3>
									<p className="text-sm text-gray-600 mt-1 leading-relaxed">
										{h.description}
									</p>
								</div>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2 text-gray-700">
									<MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
									<span>{h.address}</span>
								</div>
								<div className="flex items-center gap-4 flex-wrap">
									<div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
										<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
										<span className="font-semibold text-gray-800">
											{h.rating} / 5
										</span>
									</div>
									<div className="bg-cyan-50 px-3 py-1.5 rounded-full font-semibold text-cyan-700">
										💰 {h.price_tier}
									</div>
								</div>
								<div className="text-gray-600">
									<span className="font-medium">Amenities:</span> {h.amenities}
								</div>
								<div className="flex items-center gap-2 text-gray-700">
									<Phone className="w-4 h-4 text-cyan-600" />
									<a
										href={`tel:${h.contact_number}`}
										className="text-cyan-600 hover:text-cyan-700 font-medium"
									>
										{h.contact_number}
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			);
		}

		// Render Flights
		if (Array.isArray(structuredResult) && structuredResult[0]?.flight_name) {
			return (
				<div className="space-y-3 mt-2">
					{structuredResult.map((f, i) => (
						<div
							key={i}
							className="bg-white/95 backdrop-blur-sm border-2 border-blue-200/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300"
						>
							<div className="flex items-start gap-3 mb-3">
								<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-2.5 flex-shrink-0">
									<Plane className="w-5 h-5 text-blue-600" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
										{f.flight_name}
									</h3>
									<div className="flex items-center gap-2 mt-2 text-gray-700">
										<span className="font-semibold">{f.source_city}</span>
										<div className="flex items-center gap-1">
											<div className="w-2 h-2 rounded-full bg-blue-500"></div>
											<div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
											<Plane className="w-4 h-4 text-cyan-500" />
										</div>
										<span className="font-semibold">{f.destination_city}</span>
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div className="flex items-center gap-2 bg-blue-50 p-2.5 rounded-lg">
									<Calendar className="w-4 h-4 text-blue-600" />
									<div>
										<div className="text-xs text-gray-500">Date</div>
										<div className="font-semibold text-gray-800">
											{f.flight_date}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2 bg-cyan-50 p-2.5 rounded-lg">
									<Clock className="w-4 h-4 text-cyan-600" />
									<div>
										<div className="text-xs text-gray-500">Duration</div>
										<div className="font-semibold text-gray-800">
											{(f.duration?.Microseconds / 3_600_000_000).toFixed(1)}h
										</div>
									</div>
								</div>
							</div>
							<div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
								<div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full font-bold text-lg">
									₹{f.price?.toLocaleString()}
								</div>
								<div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold text-sm">
									{f.price_tier}
								</div>
							</div>
						</div>
					))}
				</div>
			);
		}

		// Fallback: plain text
		const finalText =
			textPart?.content?.parts?.find((p) => p.text)?.text ||
			JSON.stringify(structuredResult || chunks, null, 2);

		return <pre className="whitespace-pre-wrap">{finalText}</pre>;
	}

	// --------------------------------------------------
	// 💬 UI Layout
	// --------------------------------------------------
	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 via-cyan-50 to-blue-50 relative overflow-hidden py-20">
			{/* Animated Background */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
			</div>

			<div className="max-w-5xl mx-auto flex flex-col p-4 md:p-6" style={{ height: 'calc(100vh - 10rem)' }}>
				{/* Header */}
				<div className="bg-white/90 backdrop-blur-sm rounded-t-3xl shadow-xl border-2 border-cyan-200/50 border-b-0 p-5 md:p-6">
					<div className="flex items-center gap-4">
						<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-3 animate-pulse">
							<Sparkles className="w-7 h-7 text-blue-600" />
						</div>
						<div className="flex-1">
							<h1 className="text-2xl md:text-3xl font-extrabold">
								<span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
									AI Travel Assistant
								</span>
							</h1>
							<p className="text-sm text-gray-600 mt-1">
								Ask me about flights, hotels, or travel plans
							</p>
						</div>
						{sessionId && (
							<div className="hidden md:flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
								<span className="text-xs font-semibold text-green-700">
									Connected
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Messages Container */}
				<div className="flex-1 bg-white/80 backdrop-blur-sm border-x-2 border-cyan-200/50 overflow-y-auto p-4 md:p-6 space-y-4 min-h-0">
					{messages.map((m, i) => (
						<div
							key={i}
							className={`flex ${
								m.role === "user" ? "justify-end" : "justify-start"
							} animate-fadeIn`}
						>
							<div
								className={`max-w-[85%] md:max-w-[75%] ${
									m.role === "user"
										? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-3xl rounded-tr-md shadow-lg"
										: "bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-3xl rounded-tl-md shadow-lg"
								} p-4 transition-all duration-300 hover:shadow-xl`}
							>
								{m.role === "assistant" && (
									<div className="flex items-center gap-2 mb-2">
										<div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full p-1.5">
											<Sparkles className="w-4 h-4 text-blue-600" />
										</div>
										<span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
											AI Assistant
										</span>
									</div>
								)}
								{m.isStructured ? (
									<div className="mt-2">{m.content}</div>
								) : (
									<p
										className={`whitespace-pre-wrap leading-relaxed ${
											m.role === "user"
												? "text-white"
												: "text-gray-800"
										}`}
									>
										{m.content}
									</p>
								)}
							</div>
						</div>
					))}
					
					{/* Typing Indicator */}
					{loading && (
						<div className="flex justify-start animate-fadeIn">
							<div className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-3xl rounded-tl-md shadow-lg p-4">
								<div className="flex items-center gap-2">
									<div className="flex space-x-1">
										<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
										<div
											className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
											style={{ animationDelay: "0.1s" }}
										></div>
										<div
											className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
											style={{ animationDelay: "0.2s" }}
										></div>
									</div>
									<span className="text-sm text-gray-600 ml-2">
										AI is thinking...
									</span>
								</div>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Section */}
				<div className="bg-white/90 backdrop-blur-sm rounded-b-3xl shadow-xl border-2 border-cyan-200/50 border-t-0 p-4 md:p-6">
					<div className="flex gap-3">
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
							disabled={loading}
							className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-all bg-white text-gray-800 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
							placeholder="Type your message here..."
						/>
						<button
							onClick={handleSend}
							disabled={loading || !input.trim()}
							className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
						>
							<Send className="w-5 h-5" />
							<span className="hidden md:inline">
								{loading ? "Sending..." : "Send"}
							</span>
						</button>
					</div>
					<p className="text-xs text-gray-500 text-center mt-3">
						✨ Powered by Google Gemini AI
					</p>
				</div>
			</div>
		</div>
	);
}