import { useSwitchChain } from 'wagmi';

export function WrongNetwork() {
	const switchChain = useSwitchChain();

	return (
		<div className="absolute top-0 z-20 flex h-screen w-screen items-center justify-center bg-black/50 text-black">
			<div className="rounded-lg bg-white p-8">
				<h1 className="text-2xl font-bold">Wrong Network</h1>
				<p className="mt-4">Please switch to the correct network to continue.</p>
				<button
					onClick={() => switchChain.mutate({ chainId: 100 })}
					className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white"
				>
					Switch to Gnosis Chain
				</button>
			</div>
		</div>
	);
}
