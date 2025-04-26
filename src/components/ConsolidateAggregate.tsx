import { useState } from 'react';
import { ValidatorInfo } from '../hooks/useBeaconValidators';
import { gnosis, gnosisChiado } from 'wagmi/chains';

interface ConsolidateSelectProps {
  validators: ValidatorInfo[];
  consolidateValidators: (
    selectedPubkeys: `0x${string}`[],
    size: number
  ) => Promise<void>;
  chainId: number;
}

export function ConsolidateAggregate({
  validators,
  consolidateValidators,
  chainId,
}: ConsolidateSelectProps) {
  const isGnosisNetwork = chainId === gnosis.id || chainId === gnosisChiado.id;
  const [chunkSize, setChunkSize] = useState(isGnosisNetwork ? 40 : 1280);
  const pubkeys = validators.map((validator) => validator.pubkey);

  const numGroups = Math.ceil(validators.length / chunkSize);

  const handleConsolidate = () => {
    consolidateValidators(pubkeys, chunkSize);
  };

  return (
    <div className='w-full flex flex-col items-center justify-center gap-y-2 p-2'>
      <p className='text-xs'>Balance after consolidation: {chunkSize}</p>
      <input
        type='range'
        min={isGnosisNetwork ? 2 : 64}
        max={isGnosisNetwork ? 64 : 2048}
        value={chunkSize}
        className='range range-sm range-primary'
        onChange={(e) => setChunkSize(Number(e.target.value))}
      ></input>
      <div className='w-full flex flex-col items-center gap-y-4'>
        <p className='text-sm'>
          You will consolidate {validators.length} validators into {numGroups}{' '}
          group{numGroups > 1 && 's'} of {chunkSize} {isGnosisNetwork ? 'GNO' : 'ETH'} ( last one:{' '}
          {validators.length - (numGroups - 1) * chunkSize})
        </p>
        <button
          onClick={handleConsolidate}
          className='btn btn-primary'
        >
          Consolidate
        </button>
      </div>
    </div>
  );
}
