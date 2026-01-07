/** @type {import('next').NextConfig} */

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://rpc.gnosischain.com/ https://dune-proxy.gnosischain.com/ https://rpc.chiadochain.net/ https://indexer.hyperindex.xyz/;
	frame-ancestors https://app.safe.global;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`

const nextConfig = {
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
				  {
					key: 'Content-Security-Policy',
					value: cspHeader.replace(/\n/g, ''),
				  },
				],
			  },
			{
				source: '/manifest\\.json',
				headers: [
					{ key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: 'GET' },
					{
						key: 'Access-Control-Allow-Headers',
						value: 'X-Requested-With, Content-Type, Authorization',
					},
				],
			},
		];
	},
};

export default nextConfig;
