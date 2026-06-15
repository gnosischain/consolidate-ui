import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Providers } from './providers';
import '../index.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
	title: 'Gnosis Launchpad',
	description: 'Gnosis Beacon Chain Launchpad',
	icons: {
		icon: '/logo.svg',
	},
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const theme = cookieStore.get('theme')?.value || 'gnosis';

	return (
		<html lang="en" data-theme={theme}>
			<body>
				<Providers>
					<div className="from-base-200 to-primary/10 flex min-h-screen w-full flex-col bg-gradient-to-b from-45%">
						<Navbar />
						{children}
					</div>
				</Providers>
				<Footer />
			</body>
		</html>
	);
}
