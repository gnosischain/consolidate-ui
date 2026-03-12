import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { ValidatorInfo } from '../types/validators';
import { NetworkConfig } from '../types/network';
import { apiToValidatorInfo } from '../utils/apiConverters';
import { APIValidatorInfo } from '../types/api';

export function useBeaconValidators(
	network: NetworkConfig | undefined,
	address: Address | undefined,
) {
	const [validators, setValidators] = useState<ValidatorInfo[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!network || !address) {
			return;
		}

		const fetchAllValidators = async () => {
			setLoading(true);
			try {
				const params = new URLSearchParams({
					address: address,
					chainId: network.chainId.toString(),
				});

				const res = await fetch(`/api/validators-by-address?${params}`);

				if (!res.ok) {
					const errorData = await res.json();
					throw new Error(errorData.error || `HTTP ${res.status} - ${res.statusText}`);
				}

				const json: { data: APIValidatorInfo[] } = await res.json();

				setValidators(json.data.map(apiToValidatorInfo));
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchAllValidators();
	}, [address, network]);

	return { validators, loading, error };
}