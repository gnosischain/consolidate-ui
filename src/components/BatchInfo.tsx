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
		<div className={`fixed bottom-4 right-4 z-50 max-w-sm transition-transform duration-300 ${canBatchLoading ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
			<div className="card bg-base-100 shadow-xl border border-base-300">
				<div className="card-body p-4">
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2">
							<Layers className="w-5 h-5 text-primary" />
							<h3 className="font-semibold text-sm">Batch Transactions</h3>
						</div>
						<button
							onClick={handleDismiss}
							className="btn btn-ghost btn-xs btn-circle"
							aria-label="Dismiss"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
					
					<p className="text-xs text-base-content/70 mt-1">
						This app supports batch transactions, allowing you to handle multiple operations in a single transaction.
					</p>

					<div className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${canBatch ? 'bg-success/20' : 'bg-warning/10'}`}>
						{canBatch ? (
							<>
								<Check className="w-4 h-4" />
								<span className="text-xs font-medium">
									Your wallet supports batch transactions
								</span>
							</>
						) : (
							<>
								<AlertCircle className="w-4 h-4 text-warning" />
								<span className="text-xs font-medium text-warning">
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

