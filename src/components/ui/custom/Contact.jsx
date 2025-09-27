import React from "react";

function Contact() {
	return (
		<div className="flex flex-col items-center mx-6 md:mx-56 gap-14">
			{/* Background pattern */}
			<div className="absolute inset-0 -z-10">
				<img
					src="/travel-patternjpg.jpg"
					alt="Background pattern"
					className="w-full h-full object-cover opacity-10"
				/>
			</div>

			{/* Page Title */}
			<h1 className="font-extrabold text-4xl md:text-6xl text-center mt-20 leading-snug tracking-tight">
				<span className="text-primary/80">Get in Touch</span>
				<br />
				<span className="text-muted-foreground font-medium text-2xl">
					We’d love to hear from you
				</span>
			</h1>

			{/* Intro */}
			<p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl leading-relaxed">
				Have questions, feedback, or partnership ideas? Reach out to us and our
				team will get back to you as soon as possible.
			</p>

			{/* Contact Info Section */}
			<section className="w-full max-w-6xl mt-10 mb-20 grid md:grid-cols-3 gap-10">
				{/* Email */}
				<div className="bg-card shadow-sm hover:shadow-lg rounded-2xl border border-border p-8 text-center transition-transform hover:-translate-y-1">
					<h2 className="text-xl font-bold text-primary mb-3">📧 Email</h2>
					<p className="text-muted-foreground">
						<a
							href="mailto:support@easemyitinerary.com"
							className="text font-medium hover:text-primary"
						>
							dummy.email@support.com
						</a>
					</p>
				</div>

				{/* Phone */}
				<div className="bg-card shadow-sm hover:shadow-lg rounded-2xl border border-border p-8 text-center transition-transform hover:-translate-y-1">
					<h2 className="text-xl font-bold text-primary mb-3">📞 Phone</h2>
					<p className="text-muted-foreground font-medium">+91 00000 00000</p>
					<p className="text-xs text-muted-foreground">Mon–Fri, 10 AM – 6 PM</p>
				</div>

				{/* Office */}
				<div className="bg-card shadow-sm hover:shadow-lg rounded-2xl border border-border p-8 text-center transition-transform hover:-translate-y-1">
					<h2 className="text-xl font-bold text-primary mb-3">📍 Office</h2>
					<p className="text-muted-foreground font-medium">Bangalore, India</p>
					<p className="text-xs text-muted-foreground">Coming soon worldwide</p>
				</div>
			</section>
		</div>
	);
}

export default Contact;
