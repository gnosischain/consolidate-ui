import {
	useSendCalls,
	useSendTransaction,
	useWaitForTransactionReceipt,
	useCallsStatus,
} from 'wagmi';
import { useWallet } from '../context/WalletContext';
import { TransactionCall } from '../types/transaction';

export function useTxQueue() {
	const { canBatch } = useWallet();

	const {
		data: txHash,
		mutate: sendTx,
		status: sendTxStatus,
		error: sendTxError,
		reset: resetTx,
	} = useSendTransaction();

	const {
		data: callsData,
		mutate: sendCalls,
		status: sendCallsStatus,
		error: sendCallsError,
		reset: resetCalls,
	} = useSendCalls();

	const { isSuccess: isTxConfirmed, isPending: isTxWaiting } = useWaitForTransactionReceipt({
		hash: txHash,
	});

	const { data: callStatusData } = useCallsStatus({
		id: callsData?.id ?? '',
		query: {
			enabled: !!callsData,
			refetchInterval: (data) =>
				data.state.data?.status === 'success' || data.state.data?.status === 'failure'
					? false
					: 1000,
		},
	});

	const isPending = canBatch
		? sendCallsStatus === 'pending' ||
			(!!callsData &&
				callStatusData?.status !== 'success' &&
				callStatusData?.status !== 'failure')
		: sendTxStatus === 'pending' || (!!txHash && isTxWaiting);

	const isConfirmed = canBatch ? callStatusData?.status === 'success' : isTxConfirmed;
	const isError = canBatch ? callStatusData?.status === 'failure' : sendTxStatus === 'error';
	const error = sendCallsError ?? sendTxError;

	return {
		sendSingle: (call: TransactionCall) =>
			sendTx({ to: call.to, data: call.data, value: call.value }),
		sendBatch: (calls: TransactionCall[]) => sendCalls({ calls, capabilities: {} }),
		isPending,
		isConfirmed,
		isError,
		error,
		txHash,
		reset: () => {
			resetTx();
			resetCalls();
		},
	};
}
