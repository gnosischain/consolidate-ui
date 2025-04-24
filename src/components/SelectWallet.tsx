import { useRef } from 'react';
import { gnosis } from 'viem/chains';
import { Connector, useConnect } from 'wagmi';

export function SelectWallet() {
  const { connectors, connect } = useConnect();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const uniqueConnectors = connectors.reduce<Connector[]>((acc, connector) => {
    const names = acc.map((c) => c.name);
    if (!names.includes(connector.name)) {
      acc.push(connector);
    }
    return acc;
  }, []);

  return (
    <>
      <button className='btn' onClick={() => dialogRef.current?.showModal()}>
        Connect
      </button>
      <dialog ref={dialogRef} className='modal'>
        <div className='modal-box'>
          <h1 className='text-2xl font-bold'>Select Wallet</h1>
          <p className='text-xs text-warning text-left mb-4'>
            You need a wallet supporting 7702 batch transaction to proceed
            (currently only MetaMask)
          </p>
          {uniqueConnectors.map((connector) => {
            return (
              <div
                className='flex w-full justify-between items-center text-white btn btn-ghost'
                key={connector.uid}
                id={connector.name === 'MetaMask' ? 'metamask' : ''}
                onClick={() =>
                  connect({
                    connector: connector,
                    chainId: gnosis.id,
                  })
                }
              >
                {connector.name}
              </div>
            );
          })}
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
