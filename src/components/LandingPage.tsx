export default function LandingPage() {
	const actions = [
		{
			icon: (
				<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
			),
			title: 'Consolidate',
			description: 'Merge multiple validators into efficient 0x02 credentials',
			color: 'from-blue-500 to-cyan-500',
		},
		{
			icon: (
				<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
				</svg>
			),
			title: 'Withdraw',
			description: 'Trigger partial or full validator withdrawal operations',
			color: 'from-purple-500 to-pink-500',
		},
		{
			icon: (
				<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
				</svg>
			),
			title: 'Top-up',
			description: 'Add funds to existing validators in a single transaction',
			color: 'from-green-500 to-emerald-500',
		},
	];

	return (
		<div className="w-full flex flex-col items-center py-12 px-4 max-w-7xl mx-auto">
			{/* Hero Section - Asymmetric Layout */}
			<div className="grid md:grid-cols-2 gap-12 items-center w-full mb-24">
				<div className="space-y-6">
					<div className="inline-block">
						<span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
							Gnosis Validator Management
						</span>
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
						Your Validators,
						<br />
						<span className="text-primary">Your Control</span>
					</h1>
					<p className="text-lg text-base-content/70 leading-relaxed">
						A selection-first approach to managing validator operations. Choose your validators, 
						pick your action, execute in batch.
					</p>
				</div>

				{/* Visual Element - Action Workflow */}
				<div className="hidden md:block relative">
					<div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 border border-primary/20">
						<div className="space-y-4">
							<div className="flex items-center gap-3 bg-base-100 p-4 rounded-xl shadow-sm">
								<div className="w-3 h-3 rounded-full bg-success"></div>
								<div className="text-sm">Select validators from your portfolio</div>
							</div>
							<div className="flex justify-center">
								<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
								</svg>
							</div>
							<div className="flex items-center gap-3 bg-base-100 p-4 rounded-xl shadow-sm">
								<div className="w-3 h-3 rounded-full bg-info"></div>
								<div className="text-sm">Choose action: Consolidate, Withdraw, or Top-up</div>
							</div>
							<div className="flex justify-center">
								<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
								</svg>
							</div>
							<div className="flex items-center gap-3 bg-base-100 p-4 rounded-xl shadow-sm">
								<div className="w-3 h-3 rounded-full bg-warning"></div>
								<div className="text-sm">Execute batch operation efficiently</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Action Cards - Horizontal Layout */}
			<div className="w-full mb-16">
				<h2 className="text-3xl font-bold text-center mb-4">Powerful Batch Actions</h2>
				<p className="text-center text-base-content/60 mb-12 max-w-2xl mx-auto">
					Execute operations across multiple validators simultaneously with our intuitive dashboard controls
				</p>
				<div className="grid md:grid-cols-3 gap-6">
					{actions.map((action, index) => (
						<div
							key={index}
							className="group relative overflow-hidden bg-base-100 rounded-2xl p-6 border border-base-content/10 hover:border-transparent transition-all duration-300"
						>
							<div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
							<div className="relative z-10">
								<div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} text-white mb-4`}>
									{action.icon}
								</div>
								<h3 className="text-xl font-bold mb-2">{action.title}</h3>
								<p className="text-base-content/70">{action.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* CTA Section - More Prominent */}
			<div className="w-full max-w-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 text-center border border-primary/20 mb-12">
				<h3 className="text-2xl font-bold mb-3">Ready to Optimize Your Validators?</h3>
				<p className="text-base-content/70 mb-6">
					Connect your wallet to access your validator portfolio and start managing with ease
				</p>
				<div className="inline-flex items-center gap-2 px-6 py-3 bg-base-100 rounded-full border-2 border-primary/30">
					<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
					<span className="font-semibold">Click <span className="text-primary">Connect</span> in the top right to begin</span>
				</div>
			</div>

			{/* Security Notice - Minimalist */}
			<div className="max-w-2xl text-center">
				<p className="text-sm text-base-content/60 leading-relaxed">
					<span className="font-semibold text-base-content">Non-custodial by design.</span> You maintain complete control 
					over your validators and assets. All operations execute directly from your connected wallet.
				</p>
			</div>
		</div>
	);
}

