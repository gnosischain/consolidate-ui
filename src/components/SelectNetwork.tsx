import { useSwitchChain } from 'wagmi';
import { useEffect, useState } from 'react';

interface NetworkSwitcherProps {
	currentChainId: number;
}

export function SelectNetwork({ currentChainId }: NetworkSwitcherProps) {
	const { chains, switchChain } = useSwitchChain();
	const [selectedChain, setSelectedChain] = useState(currentChainId);

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const chainId = Number(event.target.value) as typeof currentChainId;
		const selectedChain = chains.find((chain) => chain.id === chainId);
		if (selectedChain) {
			setSelectedChain(chainId);
			switchChain({ chainId: selectedChain.id });
		}
	};

	useEffect(() => {
		setSelectedChain(currentChainId);
	}, [currentChainId]);

	return (
		<fieldset className="fieldset">
			<select value={selectedChain} onChange={handleChange} id="network" className="select">
				{chains.map((chain) => (
					<option key={chain.id} value={chain.id}>
						{chain.name}
					</option>
				))}
			</select>
		</fieldset>
	);
}
