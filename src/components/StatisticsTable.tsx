import { Statistics } from "../types/statistics";

interface StatisticsTableProps {
  statistics: Statistics;
}

export function StatisticsTable({ statistics }: StatisticsTableProps) {

  console.log(statistics);

  return (
    <div className='flex items-center justify-between rounded-lg gap-x-2'>
      <div className='flex flex-col'>
        <p className='font-light text-sm'>GNO Balance</p>
        <p className='text-2xl font-bold'>
          {/* {Number(formatEther(balance.balance)).toFixed(2)} */}
        </p>
      </div>
      <div className='flex flex-col'>
        <p className='font-light text-sm'>Ready to claim</p>
        <div className='flex gap-x-2 items-center'>
          <p className='text-2xl font-bold'>
            {/* {Number(formatEther(balance.claimBalance)).toFixed(2)} */}
          </p>
          {/* <button className="btn btn-primary btn-xs" onClick={balance.claim} disabled={balance.claimBalance === 0n}>Claim</button> */}
        </div>
      </div>
    </div>
  );
}
