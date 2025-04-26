import { useEffect, useState } from 'react';
import { ValidatorInfo } from '../hooks/useBeaconValidators';
import { gnosis, gnosisChiado } from 'wagmi/chains';
import { simulateConsolidation } from '../hooks/useConsolidate';

interface ConsolidateSelectProps {
  validators: ValidatorInfo[];
  consolidateValidators: (
    selectedPubkeys: ValidatorInfo[],
    size: number
  ) => Promise<void>;
  chainId: number;
  goToStep: () => void;
}

export function ConsolidateAggregate({
  validators,
  consolidateValidators,
  chainId,
}: ConsolidateSelectProps) {
  const isGnosisNetwork = chainId === gnosis.id || chainId === gnosisChiado.id;
  const [chunkSize, setChunkSize] = useState(isGnosisNetwork ? 40 : 1280);
  const simulation = simulateConsolidation(validators, chunkSize);

  const handleConsolidate = async () => {
    await consolidateValidators(validators, chunkSize);
  };

  useEffect(() => {
    setChunkSize(isGnosisNetwork ? 40 : 1280)
  }, [isGnosisNetwork])

  return (
    <div className='w-full flex flex-col items-center justify-center gap-y-2 p-2'>
      <p>{validators.length} validators loaded</p>
      <p className='text-xs'>Balance min: {chunkSize}</p>
      <input
        type='range'
        min={isGnosisNetwork ? 2 : 64}
        max={isGnosisNetwork ? 64 : 2048}
        value={chunkSize}
        className='range range-sm range-primary'
        onChange={(e) => setChunkSize(Number(e.target.value))}
      ></input>
      <div className='w-full flex flex-col items-center gap-y-4'>
        <div className='text-center text-sm p-2'>
          <p>{simulation.totalGroups} validators after consolidation</p>
          <p>{simulation.consolidations.length} consolidations request</p>

          {simulation.skippedValidators.length > 0 && (
            <div className='mt-2'>
              <p className='text-warning text-sm'>
                {simulation.skippedValidators.length} validators skipped
              </p>
              <ul className='list-disc list-inside text-xs mt-1'>
                {simulation.skippedValidators.map((v) => (
                  <li key={v.pubkey}>
                    {v.pubkey} ({v.balanceEth} GNO)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button onClick={handleConsolidate} className='btn btn-primary'>
          Consolidate
        </button>
      </div>
    </div>
  );
}
