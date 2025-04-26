import { useState } from 'react';
import Loader from './Loader';
import { ConsolidateInfo } from './ConsolidateInfo';
import { ConsolidateAggregate } from './ConsolidateAggregate';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { NetworkConfig } from '../constants/networks';
import { useBeaconValidators } from '../hooks/useBeaconValidators';

interface ConsolidateProps {
  contractConfig: NetworkConfig;
  address: `0x${string}`;
}

enum Steps {
  INFO = 'info',
  SELECT = 'select',
  SUMMARY = 'summary',
}

export default function Consolidate({
  contractConfig,
  address,
}: ConsolidateProps) {
  const { consolidateValidators } = useConsolidateValidatorsBatch(
    contractConfig.consolidateAddress,
  );


  const { validators, loading } = useBeaconValidators(
    contractConfig.beaconExplorerUrl,
    address
  );

  // const [validators, setValidators] = useState<Validator[]>([]);
  const [state, setState] = useState<{
    step: Steps;
    loading: boolean;
    tx: `0x${string}`;
  }>({
    step: Steps.INFO,
    loading: false,
    tx: '0x0',
  });
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
            chainId={contractConfig.chainId}
          />
        );
    }
  };

  return (
    <>
      {state.loading || loading ? (
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
