interface ConsolidateInfoProps {
    pubkeysAmount: number;
    goToStep: () => void;
  }
  
  export function ConsolidateInfo({
    pubkeysAmount,
    goToStep,
  }: ConsolidateInfoProps) {
    return (
      <div className='w-full flex flex-col items-center justify-center gap-y-2'>
        {pubkeysAmount > 0 ? (
          <>
            <p className="font-bold">You have {pubkeysAmount} public keys to consolidate.</p>
            <button
              className='btn btn-primary btn-sm mt-4'
              onClick={() => goToStep()}
              id='consolidate'
            >
              Continue
            </button>
          </>
        ) : (
          <div className='text-center mt-4'>
            You don&apos;t have any public keys to consolidate at the moment.
          </div>
        )}
      </div>
    );
  }
  