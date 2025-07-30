import { useCallback, useEffect, useState } from "react";
import useAutoclaim from "../hooks/useAutoclaim";
import { NetworkConfig } from "../types/network";
import { ModalView } from "./WalletModal";

interface AutoclaimViewProps {
    network: NetworkConfig;
    address: `0x${string}`;
    handleViewChange: (view: ModalView) => void;
}

export function AutoclaimConfigView({ network, address, handleViewChange }: AutoclaimViewProps) {
    const {
        register,
        updateConfig,
        unregister,
        isRegister,
        autoclaimSuccess,
        autoclaimHash,
    } = useAutoclaim(network, address);
    const [timeValue, setTimeValue] = useState(1);
    const [timeUnit, setTimeUnit] = useState("days");
    const [claimAction, setClaimAction] = useState("pay");
    const [amountValue, setAmountValue] = useState("1");
    const [loading, setLoading] = useState(false);


    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setClaimAction(event.target.value);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = event.target.value;
        setAmountValue(inputVal);
    };

    const handleTimeValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = event.target.value;
        setTimeValue(parseInt(inputVal));
    };

    const handleTimeUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeUnit(event.target.value);
    };

    const onAutoclaim = useCallback(async () => {
        const parsedValue = parseFloat(amountValue.replace(/,/, "."));
        if (!isNaN(parsedValue) && parsedValue > 0) {
            setLoading(true);
            if (isRegister) {
                await updateConfig(timeValue, parsedValue);
            } else {
                await register(timeValue, parsedValue);
            }
        }
    }, [timeValue, amountValue, isRegister, register, updateConfig]);

    const onUnregister = useCallback(async () => {
        setLoading(true);
        await unregister();
    }, [unregister]);

    useEffect(() => {
        if (autoclaimSuccess) {
            setLoading(false);
            handleViewChange('autoclaim-success');
        }
    }, [autoclaimSuccess]);

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
                            onChange={handleRadioChange}
                            defaultChecked
                            type="radio"
                            value={1}
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
                            onChange={handleRadioChange}
                            type="radio"
                            value={7}
                            name="time-threshold"
                            className="sr-only peer"
                        />
                        <div className="border-1 border-base-300 rounded-lg text-center py-1 transition-all peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary-content peer-checked:shadow-lg hover:border-primary hover:border-opacity-50">
                            <div className="font-medium text-sm">None</div>
                            <div className="text-xs opacity-70 mt-1">No action</div>
                        </div>
                    </label>
                </div>

                <div className="flex flex-col p-2 bg-base-200/40 rounded-box mt-8">
                    {/* Time Threshold Section */}
                    <fieldset className="fieldset rounded-box">
                        <legend className="fieldset-legend">Frequency</legend>
                        <div className="flex w-full items-center join">
                            <input
                                type="number"
                                className="input input-sm join-item validator w-16"
                                required
                                min="1"
                                max="100"
                                value={timeValue.toString()}
                                onChange={handleTimeValueChange}
                            />
                            <select defaultValue={timeUnit} className="select select-sm w-24 join-item" onChange={handleTimeUnitChange}>
                                <option>days</option>
                                <option>weeks</option>
                                <option>months</option>
                            </select>
                        </div>
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
                                onChange={handleInputChange}
                            />GNO

                        </label>
                    </fieldset>
                </div>

                <button
                    className="btn btn-primary btn-sm mt-8"
                    onClick={onAutoclaim}
                >
                    {loading ? 'Processing...' : (isRegister ? "Save changes" : "Register for Autoclaim")}
                </button>
                {isRegister && (
                    <div>
                        <button
                            className="btn btn-ghost btn-xs mt-4"
                            onClick={onUnregister}
                        >
                            {loading ? 'Processing...' : 'Unsubscribe'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
} 