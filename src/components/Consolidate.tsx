import { useEffect, useState } from 'react';
import Loader from './Loader';
import { ConsolidateInfo } from './ConsolidateInfo';
import { ConsolidateAggregate } from './ConsolidateAggregate';
import {
  fetchChiadoValidators,
  fetchValidators,
  Validator,
  useConsolidateValidatorsBatch,
} from '../hooks/useConsolidate';
import { NetworkConfig } from '../constants/networks';

interface ConsolidateProps {
  contractConfig: NetworkConfig;
  address: `0x${string}`;
  chainId: number;
}

enum Steps {
  INFO = 'info',
  SELECT = 'select',
  SUMMARY = 'summary',
}

export default function Consolidate({
  contractConfig,
  address,
  chainId,
}: ConsolidateProps) {
  const { consolidateValidators } = useConsolidateValidatorsBatch(
    contractConfig.consolidateAddress,
    chainId
  );

  const [validators, setValidators] = useState<Validator[]>([]);
  const [state, setState] = useState<{
    step: Steps;
    loading: boolean;
    tx: `0x${string}`;
  }>({
    step: Steps.INFO,
    loading: false,
    tx: '0x0',
  });

  useEffect(() => {
    const fetchValidatorData = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        if (contractConfig?.beaconExplorerUrl && address) {
          const data =
            chainId === 10200
              ? await fetchChiadoValidators(address)
              : await fetchValidators(
                  contractConfig.beaconExplorerUrl,
                  '0x78E87757861185Ec5e8C0EF6BF0C69Fa7832df6C'
                );
          setValidators(data);
        } else {
          throw new Error('Beacon Explorer URL is undefined');
        }
      } catch (err) {
        console.log('Error fetching validators:', err, address);
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchValidatorData();
  }, [address, chainId, contractConfig.beaconExplorerUrl]);

  const renderStep = () => {
    switch (state.step) {
      case Steps.INFO:
        return (
          <ConsolidateInfo
            pubkeysAmount={validators.length}
            goToStep={() =>
              setState((prev) => ({ ...prev, step: Steps.SELECT }))
            }
          />
        );
      case Steps.SELECT:
        return (
          <ConsolidateAggregate
            validators={validators}
            consolidateValidators={consolidateValidators}
          />
        );
    }
  };

  return (
    <>
      {state.loading ? (
        <>
          <Loader />
          <p className='mt-2'>Loading...</p>
        </>
      ) : (
        renderStep()
      )}
    </>
  );
}
