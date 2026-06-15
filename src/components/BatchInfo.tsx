import { useState, useEffect } from 'react';
import { X, Layers, Check, AlertCircle } from 'lucide-react';

interface BatchInfoProps {
	canBatch: boolean;
	canBatchLoading: boolean;
}

const STORAGE_KEY = 'batch-info-dismissed';

export function BatchInfo({ canBatch, canBatchLoading }: BatchInfoProps) {
	const [isDismissed, setIsDismissed] = useState(true);

	useEffect(() => {
		const dismissed = localStorage.getItem(STORAGE_KEY);
		setIsDismissed(dismissed === 'true');
	}, []);

	const handleDismiss = () => {
		localStorage.setItem(STORAGE_KEY, 'true');
		setIsDismissed(true);
	};

	if (isDismissed) return null;

	return (
		<div
			className={`fixed right-4 bottom-4 z-50 max-w-sm transition-transform duration-300 ${canBatchLoading ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
		>
			<div className="card bg-base-100 border-base-300 border shadow-xl">
				<div className="card-body p-4">
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2">
							<Layers className="text-primary h-5 w-5" />
							<h3 className="text-sm font-semibold">Batch Transactions</h3>
						</div>
						<button
							onClick={handleDismiss}
							className="btn btn-ghost btn-xs btn-circle"
							aria-label="Dismiss"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					<p className="text-base-content/70 mt-1 text-xs">
						This app supports batch transactions, allowing you to handle multiple operations in a
						single transaction.
					</p>

					<div
						className={`mt-2 flex items-center gap-2 rounded-lg p-2 ${canBatch ? 'bg-success/20' : 'bg-warning/10'}`}
					>
						{canBatch ? (
							<>
								<Check className="h-4 w-4" />
								<span className="text-xs font-medium">Your wallet supports batch transactions</span>
							</>
						) : (
							<>
								<AlertCircle className="text-warning h-4 w-4" />
								<span className="text-warning text-xs font-medium">
									Your wallet doesn&apos;t support batch transactions
								</span>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
