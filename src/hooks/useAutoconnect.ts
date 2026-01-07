import { useEffect } from 'react';
import { useConnectors } from 'wagmi';

const AUTOCONNECTED_CONNECTOR_IDS = ['safe'];

function useAutoConnect() {
    const connectors = useConnectors()

    useEffect(() => {
        const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
        if (!isInIframe) return;

        AUTOCONNECTED_CONNECTOR_IDS.forEach((connector) => {
            const connectorInstance = connectors.find((c) => c.id === connector);

            if (connectorInstance) {
                connectorInstance.connect().catch(() => {
                });
            }
        });
    }, [connectors]);
}

export { useAutoConnect };