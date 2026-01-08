import { useEffect } from 'react';
import { useConnectors } from 'wagmi';

const AUTOCONNECTED_CONNECTOR_IDS = ['safe'];

function useAutoConnect(enabled: boolean = true) {
    const connectors = useConnectors();

    useEffect(() => {
        if (!enabled) return;

        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
        if (!isInIframe) return;

        AUTOCONNECTED_CONNECTOR_IDS.forEach((connectorId) => {

            const connectorInstance = connectors.find((c) => c.id === connectorId);
            if (connectorInstance) {
                connectorInstance.connect().catch((error: Error) => {
                    console.error(`[useAutoConnect] Failed to connect ${connectorId}:`, error);
                });
            }
        });
    }, [enabled, connectors]);
}

export { useAutoConnect };