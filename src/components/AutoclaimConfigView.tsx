import { useCallback, useEffect, useMemo, useState } from "react";
import useAutoclaim from "../hooks/useAutoclaim";
import { NetworkConfig } from "../types/network";
import type { ModalView } from "./WalletModal";
import { SECOND_IN_DAY, ZERO_ADDRESS } from "../constants/misc";
import { formatEther, isAddress } from "viem";

interface AutoclaimViewProps {
    network: NetworkConfig;
    address: `0x${string}`;
    handleViewChange: (view: ModalView) => void;
}

export function AutoclaimConfigView({ network, address, handleViewChange }: AutoclaimViewProps) {
    const {
        register,
        setActionContract,
        updateConfig,
        unregister,
        setForwardingAddress,
        approve,
        userConfig,
        forwardingAddress,
        actionContract,
        transactionLoading,
    } = useAutoclaim(network, address);
    const [timeValue, setTimeValue] = useState(1);
    const [claimAction, setClaimAction] = useState<`0x${string}`>(ZERO_ADDRESS);
    const [amountValue, setAmountValue] = useState("1");
    const [forwardingAddressValue, setForwardingAddressValue] = useState<string>("");

    const isRegister = userConfig?.[4] === 1 ? true : false;

    useEffect(() => {
        if (!isRegister && network.payClaimActionAddress) {
            setClaimAction(network.payClaimActionAddress);
        } else if (actionContract) {
            setClaimAction(actionContract);
        }
    }, [actionContract, isRegister, network.payClaimActionAddress]);

    useEffect(() => {
        if (userConfig) {
            setTimeValue(userConfig?.[2] ? Number(userConfig[2]) / SECOND_IN_DAY : 1);
            setAmountValue(userConfig?.[3] ? formatEther(userConfig[3]) : "1");
        }
    }, [userConfig]);

    useEffect(() => {
        if (forwardingAddress && forwardingAddress !== ZERO_ADDRESS && isRegister) {
            setForwardingAddressValue(forwardingAddress);
        }
    }, [forwardingAddress]);


    const handleClaimActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setClaimAction(event.target.value as `0x${string}`);
    };

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = event.target.value;
        setAmountValue(inputVal);
    };

    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = event.target.value;
        setTimeValue(parseInt(inputVal));
    };

    const handleForwardingAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForwardingAddressValue(event.target.value);
    };

    const plannedActions = useMemo(() => {
        const actions: { action: () => Promise<void>, name: string }[] = [];
        const isGnosisPaySelected = claimAction === network.payClaimActionAddress;
        const thresholdsChanged = !!(
            userConfig?.[2] &&
            userConfig?.[3] &&
            (timeValue !== Number(userConfig[2]) / SECOND_IN_DAY || amountValue !== formatEther(userConfig[3]))
        );
        const actionChanged = actionContract !== claimAction;
        
        const needsForwardingAddress = () => {
            return isGnosisPaySelected && 
                   forwardingAddressValue !== forwardingAddress && 
                   isAddress(forwardingAddressValue);
        };

        // Case 1: New user registration
        if (!isRegister) {
            if (isGnosisPaySelected) {
                if (!isAddress(forwardingAddressValue)) {
                    return actions;
                }
                actions.push({ action: () => setForwardingAddress(forwardingAddressValue as `0x${string}`), name: "Set forwarding address" });
                actions.push({ action: () => approve(), name: "Approve" });
            }
            actions.push({ action: () => register(timeValue, parseFloat(amountValue), claimAction), name: "Register" });
            return actions;
        }

        // Case 2: Existing user - action changed
        if (actionChanged) {
            if (isGnosisPaySelected) {
                const hasExistingForwarding = forwardingAddress && forwardingAddress !== ZERO_ADDRESS;
                if (!hasExistingForwarding && !isAddress(forwardingAddressValue)) {
                    return actions;
                }
                if (needsForwardingAddress()) {
                    actions.push({ action: () => setForwardingAddress(forwardingAddressValue as `0x${string}`), name: "Set forwarding address" });
                }
                actions.push({ action: () => approve(), name: "Approve" });
            }
            actions.push({ action: () => setActionContract(claimAction), name: "Set action contract" });
            return actions;
        }

        // Case 3: Existing user - same action, update forwarding address
        if (needsForwardingAddress()) {
            actions.push({ action: () => setForwardingAddress(forwardingAddressValue as `0x${string}`), name: "Set forwarding address" });
        }

        // Case 4: Existing user - update thresholds
        if (thresholdsChanged) {
            actions.push({ action: () => updateConfig(timeValue, parseFloat(amountValue)), name: "Update config" });
        }

        return actions;
    }, [
        isRegister,
        claimAction,
        network.payClaimActionAddress,
        forwardingAddressValue,
        forwardingAddress,
        actionContract,
        userConfig,
        timeValue,
        amountValue,
    ]);

        const buttonText = useMemo(() => {
        if (transactionLoading) return "Processing...";
        if (plannedActions.length === 0) return "Save";
        return plannedActions[0]?.name;
    }, [transactionLoading, plannedActions, isRegister]);

    const onAutoclaim = useCallback(async () => {
        try {
            await plannedActions[0].action();
            plannedActions.shift();
        } catch (error) {
            console.error(error);
        }
    }, [plannedActions]);

    const onUnregister = useCallback(async () => {
        await unregister();
    }, [unregister]);

    return (
        <>
            {/* Header with Back Button */}
            <div className="px-4 py-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => handleViewChange('main')}
                        className="btn btn-ghost btn-sm btn-circle"
                        aria-label="Back to wallet"
                    >
                        <img src="/arrow-left.svg" alt='Back' className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-base">Autoclaim Registry</h3>
                    {isRegister && (
                        <div className="badge badge-success badge-sm mt-1">Active</div>
                    )}
                </div>
            </div>

            {/* Autoclaim Content */}
            <div className="w-full text-sm flex flex-col justify-center p-4">
                <div className="text-sm">Set up automated claim with your preferred frequency and threshold.{" "}
                    <div className="tooltip tooltip-left" data-tip="Address will become eligable for claim if one of thresholds reached.">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
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
                            />days
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
                            />GNO

                        </label>
                    </fieldset>
                </div>

                <button
                    className="btn btn-primary btn-sm mt-8"
                    disabled={plannedActions.length === 0 || transactionLoading}
                    onClick={onAutoclaim}
                >
                    {buttonText}
                </button>
                {isRegister && (
                    <div>
                        <button
                            className="btn btn-ghost btn-xs mt-4"
                            onClick={onUnregister}
                        >
                            {transactionLoading ? 'Processing...' : 'Unsubscribe'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
} 