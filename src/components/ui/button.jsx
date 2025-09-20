import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(
	({ className, children, variant = "default", ...props }, ref) => {
		const baseStyles =
			"px-4 py-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";

		const variants = {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			soft: "bg-primary/10 text-primary hover:bg-primary/20",
			outline:
				"border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
			destructive:
				"bg-destructive text-destructive-foreground hover:bg-destructive/90",
		};

		return (
			<button
				ref={ref}
				className={cn(baseStyles, variants[variant], className)}
				{...props}
			>
				{children}
			</button>
		);
	}
);

Button.displayName = "Button";

export { Button };
