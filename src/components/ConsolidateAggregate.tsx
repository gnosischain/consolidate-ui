import { useState } from 'react';
import { ValidatorInfo } from '../hooks/useBeaconValidators';

interface ConsolidateSelectProps {
  validators: ValidatorInfo[];
  consolidateValidators: (
    selectedPubkeys: `0x${string}`[],
    size: number
  ) => Promise<void>;
}

export function ConsolidateAggregate({
  validators,
  consolidateValidators,
}: ConsolidateSelectProps) {
  const [chunkSize, setChunkSize] = useState(40);
  const pubkeys = validators.map((validator) => validator.pubkey);

  const numGroups = Math.ceil(validators.length / chunkSize);

  const handleConsolidate = () => {
    consolidateValidators(pubkeys, chunkSize);
  };

  return (
    <div className='w-full flex flex-col items-center justify-center gap-y-2 p-2'>
      <p className='text-xs'>Chunk size: {chunkSize}</p>
      <input
        type='range'
        min={2}
        max={64}
        value={chunkSize}
        className='range range-sm range-primary'
        onChange={(e) => setChunkSize(Number(e.target.value))}
      ></input>
      <div className='w-full flex flex-col items-center gap-y-4'>
        <p className='text-sm'>
          You will consolidate {validators.length} validators into {numGroups}{' '}
          group{numGroups > 1 && 's'} of {chunkSize} GNO ( last one:{' '}
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
