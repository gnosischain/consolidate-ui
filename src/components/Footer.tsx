import { ThemeToggle } from './ThemeToggle';

export default function Footer() {
	return (
		<div className="footer bg-primary/10 text-base-content flex items-end justify-between p-4">
			<p>Copyright © 2025 - All rights reserved by Gnosis</p>
			<ThemeToggle />
		</div>
	);
}
