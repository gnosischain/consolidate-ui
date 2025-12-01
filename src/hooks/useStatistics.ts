import { useState, useEffect } from 'react';
import { Statistics } from '../types/statistics';

export function useStatistics(validatorIndex: string) {
    const [statistics, setStatistics] = useState<Statistics>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams({
                    validatorIndex: validatorIndex,
                });

                const res = await fetch(`/api/statistics?${params}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP ${res.status} - ${res.statusText}`);
                }

                // const json: { data: APIValidatorInfo[] } = await res.json();
                // const validators = json.data.map(apiToValidatorInfo);
                setStatistics(undefined);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [validatorIndex]);

    return { statistics, loading, error };
}


