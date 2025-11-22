import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface UseTransactionToastParams {
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
  loadingMessage: string;
  successMessage: string;
  onSuccess?: () => void;
}

export function useTransactionToast({
  isLoading,
  isSuccess,
  error,
  loadingMessage,
  successMessage,
  onSuccess,
}: UseTransactionToastParams) {
  const toastId = useRef<string | undefined>(undefined);

  // Handle loading state
  useEffect(() => {
    if (isLoading) {
      toastId.current = toast.loading(loadingMessage);
    } else {
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = undefined;
      }
    }
  }, [isLoading, loadingMessage]);

  // Handle success state
  useEffect(() => {
    if (isSuccess) {
      toast.success(successMessage);
      onSuccess?.();
    }
  }, [isSuccess, successMessage, onSuccess]);

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error(error.message.substring(0, 50));
    }
  }, [error]);
}

