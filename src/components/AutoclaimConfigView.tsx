import { useMemo, useState } from 'react';
import useAutoclaim from '../hooks/useAutoclaim';
import { NetworkConfig } from '../types/network';
import { SECOND_IN_DAY, ZERO_ADDRESS } from '../constants/misc';
import { formatEther, isAddress } from 'viem';
import { TransactionCall } from '../types/transaction';
import { TransactionButton } from './TransactionButton';

interface AutoclaimConfigViewProps {
	network: NetworkConfig;
	address: `0x${string}`;
}

export function AutoclaimConfigView({ network, address }: AutoclaimConfigViewProps) {
	const {
		buildRegisterCall,
		buildSetActionContractCall,
		buildUpdateConfigCall,
		buildUnregisterCall,
		buildSetForwardingAddressCall,
		buildApproveCall,
		onSuccess,
		userConfig,
		forwardingAddress,
		actionContract,
		isRegistered,
	} = useAutoclaim(network, address);
	const [timeValue, setTimeValue] = useState(1);
	const [claimAction, setClaimAction] = useState<`0x${string}`>(ZERO_ADDRESS);
	const [amountValue, setAmountValue] = useState('1');
	const [forwardingAddressValue, setForwardingAddressValue] = useState<string>('');

	// Track previous dependency values to detect changes during render (avoids setState-in-effect pattern)
	const [prevUserConfig, setPrevUserConfig] = useState(userConfig);
	const [prevClaimActionDeps, setPrevClaimActionDeps] = useState({ actionContract, isRegistered });
	const [prevForwardingDeps, setPrevForwardingDeps] = useState({ forwardingAddress, isRegistered });

	if (prevUserConfig !== userConfig) {
		setPrevUserConfig(userConfig);
		if (userConfig) {
			setTimeValue(userConfig[2] ? Number(userConfig[2]) / SECOND_IN_DAY : 1);
			setAmountValue(userConfig[3] ? formatEther(userConfig[3]) : '1');
		}
	}

	if (prevClaimActionDeps.actionContract !== actionContract || prevClaimActionDeps.isRegistered !== isRegistered) {
		setPrevClaimActionDeps({ actionContract, isRegistered });
		if (!isRegistered && network.payClaimActionAddress) {
			setClaimAction(network.payClaimActionAddress);
		} else if (actionContract) {
			setClaimAction(actionContract);
		}
	}

	if (prevForwardingDeps.forwardingAddress !== forwardingAddress || prevForwardingDeps.isRegistered !== isRegistered) {
		setPrevForwardingDeps({ forwardingAddress, isRegistered });
		if (forwardingAddress && forwardingAddress !== ZERO_ADDRESS && isRegistered) {
			setForwardingAddressValue(forwardingAddress);
		}
	}

	const handleClaimActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setClaimAction(event.target.value as `0x${string}`);
	};

	const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAmountValue(event.target.value);
	};

	const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTimeValue(parseInt(event.target.value));
	};

	const handleForwardingAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setForwardingAddressValue(event.target.value);
	};

	const plannedCalls = useMemo((): TransactionCall[] => {
		const calls: TransactionCall[] = [];
		const isGnosisPaySelected = claimAction === network.payClaimActionAddress;
		const thresholdsChanged = !!(
			userConfig?.[2] &&
			userConfig?.[3] &&
			(timeValue !== Number(userConfig[2]) / SECOND_IN_DAY ||
				amountValue !== formatEther(userConfig[3]))
		);
		const actionChanged = actionContract !== claimAction;

		const needsForwardingAddress =
			isGnosisPaySelected &&
			forwardingAddressValue !== forwardingAddress &&
			isAddress(forwardingAddressValue);

		// Case 1: New user registration
		if (!isRegistered) {
			if (isGnosisPaySelected) {
				if (!isAddress(forwardingAddressValue)) return calls;
				const fwdCall = buildSetForwardingAddressCall(forwardingAddressValue as `0x${string}`);
				if (fwdCall) calls.push(fwdCall);
				const approveCall = buildApproveCall();
				if (approveCall) calls.push(approveCall);
			}
			const registerCall = buildRegisterCall(timeValue, parseFloat(amountValue), claimAction);
			if (registerCall) calls.push(registerCall);
			return calls;
		}

		// Case 2: Existing user - action changed
		if (actionChanged) {
			if (isGnosisPaySelected) {
				const hasExistingForwarding = forwardingAddress && forwardingAddress !== ZERO_ADDRESS;
				if (!hasExistingForwarding && !isAddress(forwardingAddressValue)) return calls;
				if (needsForwardingAddress) {
					const fwdCall = buildSetForwardingAddressCall(forwardingAddressValue as `0x${string}`);
					if (fwdCall) calls.push(fwdCall);
				}
				const approveCall = buildApproveCall();
				if (approveCall) calls.push(approveCall);
			}
			const actionCall = buildSetActionContractCall(claimAction);
			if (actionCall) calls.push(actionCall);
			return calls;
		}

		// Case 3: Existing user - same action, update forwarding address
		if (needsForwardingAddress) {
			const fwdCall = buildSetForwardingAddressCall(forwardingAddressValue as `0x${string}`);
			if (fwdCall) calls.push(fwdCall);
		}

		// Case 4: Existing user - update thresholds
		if (thresholdsChanged) {
			const configCall = buildUpdateConfigCall(timeValue, parseFloat(amountValue));
			if (configCall) calls.push(configCall);
		}

		return calls;
	}, [
		isRegistered,
		claimAction,
		network.payClaimActionAddress,
		forwardingAddressValue,
		forwardingAddress,
		actionContract,
		userConfig,
		timeValue,
		amountValue,
		buildSetForwardingAddressCall,
		buildApproveCall,
		buildRegisterCall,
		buildSetActionContractCall,
		buildUpdateConfigCall,
	]);

	const unregisterCalls = useMemo((): TransactionCall[] => {
		const call = buildUnregisterCall();
		return call ? [call] : [];
	}, [buildUnregisterCall]);

	return (
		<>
			{/* Header with Back Button */}
			<div className="px-4 py-4 border-b border-base-300">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-base">Autoclaim Registry</h3>
					{isRegistered && <div className="badge badge-accent badge-sm mt-1">Active</div>}
				</div>
			</div>

			{/* Autoclaim Content */}
			<div className="w-full text-sm flex flex-col justify-center p-4">
				<div className="text-sm">
					Set up automated claim with your preferred frequency and threshold.{' '}
					<div
						className="tooltip tooltip-left"
						data-tip="Address will become eligible for claim if one of thresholds reached."
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="size-5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
							/>
						</svg>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 mt-8">
					<label className="cursor-pointer">
						<input
							onChange={handleClaimActionChange}
							checked={claimAction === network.payClaimActionAddress}
							type="radio"
							value={network.payClaimActionAddress}
							name="time-threshold"
							className="sr-only peer"
						/>
						<div className="border-1 border-base-300 rounded-lg text-center py-1 transition-all peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary-content peer-checked:shadow-lg hover:border-primary hover:border-opacity-50">
							<div className="font-medium text-sm">Gnosis Pay</div>
							<div className="text-xs opacity-70 mt-1">Top up your account</div>
						</div>
					</label>

					<label className="cursor-pointer">
						<input
							onChange={handleClaimActionChange}
							checked={claimAction === ZERO_ADDRESS}
							type="radio"
							value={ZERO_ADDRESS}
							name="time-threshold"
							className="sr-only peer"
						/>
						<div className="border-1 border-base-300 rounded-lg text-center py-1 transition-all peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary-content peer-checked:shadow-lg hover:border-primary hover:border-opacity-50">
							<div className="font-medium text-sm">None</div>
							<div className="text-xs opacity-70 mt-1">No action</div>
						</div>
					</label>
				</div>

				{claimAction === network.payClaimActionAddress && (
					<input
						type="text"
						className="input input-sm w-full validator mt-3"
						required
						placeholder="Enter your Gnosis Pay address"
						pattern="^0x[a-fA-F0-9]{40}$"
						title="Must be a valid Gnosis Pay address"
						value={forwardingAddressValue}
						onChange={handleForwardingAddressChange}
					/>
				)}

				<div className="flex flex-col p-2 rounded-box mt-4">
					{/* Time Threshold Section */}
					<fieldset className="fieldset rounded-box">
						<legend className="fieldset-legend">Frequency</legend>
						<label className="input input-sm w-24 validator">
							<input
								type="number"
								required
								min="1"
								max="100"
								value={timeValue.toString()}
								onChange={handleTimeChange}
							/>
							days
						</label>
					</fieldset>

					{/* Amount Threshold Section */}
					<fieldset className="fieldset rounded-box">
						<legend className="fieldset-legend">Amount Threshold</legend>
						<label className="input input-sm w-24 validator">
							<input
								type="number"
								required
								min="1"
								max="100"
								title="Must be between be 1 to 100"
								value={amountValue.toString()}
								onChange={handleAmountChange}
							/>
							GNO
						</label>
					</fieldset>
				</div>

				<TransactionButton
					calls={plannedCalls}
					onSuccess={onSuccess}
					className="btn btn-primary btn-sm mt-8"
				>
					{plannedCalls[0]?.title ?? 'Save'}
				</TransactionButton>

				{isRegistered && (
					<div>
						<TransactionButton
							calls={unregisterCalls}
							onSuccess={onSuccess}
							className="btn btn-ghost btn-xs mt-4"
						>
							Unsubscribe
						</TransactionButton>
					</div>
				)}
			</div>
		</>
	);
}
