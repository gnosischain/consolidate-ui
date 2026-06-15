# Consolidation UI

A web interface for consolidating and managing validator data.
Network supported: Gnosis Chain, Ethereum, Chiado, Sepolia.

## Features

- View and filter validator information
- Aggregate and consolidate validator data

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) — version pinned in [`.nvmrc`](./.nvmrc) (run `nvm use`)
- [pnpm](https://pnpm.io/) package manager (`corepack enable`)

### Installation

Clone the repository and install dependencies:

```bash
pnpm install
```

### Running the Development Server

Copy the `.env.example` file to `.env` and fill in the values (see
[Environment variables](#environment-variables)).

Start the app locally:

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

To build the app for production:

```bash
pnpm build
```

## Environment variables

Validated at startup by [`src/env.ts`](./src/env.ts); a missing **required**
variable fails the build/boot with a clear error. See `.env.example` for the
full list.

| Variable                                                         | Required | Purpose                                                     |
| ---------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `GNOSIS_VALIDATORS_API_URL` / `GNOSIS_VALIDATORS_API_KEY`        | ✅       | Validator indexer for Gnosis (`/api/validators-by-address`) |
| `CHIADO_VALIDATORS_API_URL` / `CHIADO_VALIDATORS_API_KEY`        | ✅       | Validator indexer for Chiado                                |
| `GRAPHQL_URL`                                                    | –        | Deposit-event lookups (`/api/validate-deposit`)             |
| `NEXT_PUBLIC_QUICKNODE_ENDPOINT` / `NEXT_PUBLIC_QUICKNODE_TOKEN` | –        | QuickNode RPC for Ethereum mainnet/Sepolia only             |

Set `SKIP_ENV_VALIDATION=1` to bypass validation (used by CI builds, which run
without secrets).

## Scripts

| Command                             | Description                                |
| ----------------------------------- | ------------------------------------------ |
| `pnpm dev`                          | Start the dev server                       |
| `pnpm build` / `pnpm start`         | Production build / serve                   |
| `pnpm typecheck`                    | `tsc --noEmit`                             |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (Next flat config)                  |
| `pnpm format` / `pnpm format:check` | Prettier write / check                     |
| `pnpm clean`                        | Remove `.next`, `node_modules`, build info |
| `pnpm audit`                        | Dependency security audit                  |

Git hooks (husky) run automatically: **pre-commit** formats/lints staged files
via lint-staged, **pre-push** runs `pnpm typecheck`.

## Project Structure

- `src/components/` – React components
- `src/hooks/` – Custom React hooks
- `src/constants/` – Network and configuration constants
- `src/types/` – TypeScript type definitions
- `src/utils/` – Utility functions

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.
