# Consolidation UI

A web interface for consolidating and managing validator data.
Network supported: Gnosis Chain, Ethereum, Chiado, Sepolia.

## Features
- View and filter validator information
- Aggregate and consolidate validator data

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.20.1 or higher recommended)
- [pnpm](https://pnpm.io/) package manager

### Installation

Clone the repository and install dependencies:

```bash
pnpm install
```

### Running the Development Server

Copy the `.env.example` file to `.env` and fill in the values.

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

## Project Structure
- `src/components/` – React components
- `src/hooks/` – Custom React hooks
- `src/constants/` – Network and configuration constants
- `src/types/` – TypeScript type definitions
- `src/utils/` – Utility functions

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

