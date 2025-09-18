import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({ className, children, ...props }, ref) => {
	return (
		<button
			ref={ref}
			className={cn(
				"bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition",
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
});
Button.displayName = "Button";

export { Button };
