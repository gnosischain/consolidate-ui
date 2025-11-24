import { ThemeToggle } from "./ThemeToggle";

export default function Footer() {
	return (
		<div className="footer p-4 bg-primary/10 text-base-content flex justify-between items-end">
			<p>Copyright © 2025 - All rights reserved by Gnosis</p>
			<ThemeToggle />
		</div>
	);
}