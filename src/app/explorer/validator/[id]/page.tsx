import { notFound, permanentRedirect } from 'next/navigation';
import { gnosis } from 'wagmi/chains';
import { NETWORK_CONFIG } from '../../../../constants/networks';
import { ValidatorView } from './ValidatorView';

const PUBKEY_RE = /^(0x)?[0-9a-fA-F]{96}$/;
const INDEX_RE = /^\d+$/;

async function resolveIndexFromPubkey(pubkey: string, chainId: number): Promise<number | null> {
	const network = NETWORK_CONFIG[chainId];
	if (!network) return null;

	const url = new URL('/eth/v1/beacon/states/finalized/validators', network.clEndpoint);
	url.searchParams.set('id', pubkey);

	try {
		const res = await fetch(url, { next: { revalidate: 60 } });
		if (!res.ok) return null;
		const json = await res.json();
		const index = json?.data?.[0]?.index;
		return index !== undefined ? Number(index) : null;
	} catch {
		return null;
	}
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	if (PUBKEY_RE.test(id)) {
		const pubkey = id.startsWith('0x') ? id.toLowerCase() : `0x${id.toLowerCase()}`;
		// TODO: derive chainId from user session/cookie instead of defaulting
		const index = await resolveIndexFromPubkey(pubkey, gnosis.id);
		if (index === null) notFound();
		permanentRedirect(`/explorer/validator/${index}`);
	}

	if (!INDEX_RE.test(id)) notFound();

	return <ValidatorView validatorIndex={id} />;
}
