# ProofMint SDK

Typed TypeScript client for the ProofMint contract and API.

The SDK is the integration layer for web applications and third-party verifiers. It does not issue credentials by itself: credential issuance still requires an authorized Stellar wallet and the contract's authorization rules. It provides the shared types, contract read helpers, API client, and metadata hashing conventions that keep consumers consistent.

## Role in ProofMint

- `ProofMintContract` reads authoritative state from the Soroban contract through Stellar RPC.
- `ProofMintApi` reads indexed credentials, issuer records, events, and public metadata.
- Hash helpers ensure metadata sent to the API matches the hash committed on-chain.
- The web app consumes these concepts directly today and can adopt this package as the live integration matures.

## Installation

```bash
npm install @proofmintx/sdk
```

## Quick Start

```typescript
import { ProofMintContract, ProofMintApi, hashCredentialMetadata } from "@proofmintx/sdk";
import { Networks } from "@stellar/stellar-sdk";

const config = {
  network: "testnet" as const,
  rpcUrl: "https://soroban-testnet.stellar.org",
  contractId: "C...",
  apiUrl: "http://localhost:3001",
  networkPassphrase: Networks.TESTNET,
};

// Contract interaction
const contract = new ProofMintContract(config);

const status = await contract.verifyCredential(1n);
console.log(status); // "Active" | "Expired" | "Revoked" | "NotFound"

const credential = await contract.getCredential(1n);
console.log(credential?.recipient);

const isIssuer = await contract.isIssuer("G...");

// Metadata hashing
const metadata = {
  title: "Certificate of Completion",
  course: "Blockchain Basics",
  issued_to: "Alice",
};

const hash = hashCredentialMetadata(metadata);

// API interaction
const api = new ProofMintApi(config);

await api.postMetadata(hash, metadata);
const verify = await api.verifyCredential("1");
```

## API

### `ProofMintContract`

- `verifyCredential(credentialId: bigint): Promise<CredentialStatus>`
- `getCredential(credentialId: bigint): Promise<Credential | null>`
- `isIssuer(wallet: string): Promise<boolean>`
- `getAdmin(): Promise<string>`

### `ProofMintApi`

- `getCredential(id: string): Promise<ApiCredential>`
- `verifyCredential(id: string): Promise<ApiCredential>`
- `getIssuer(wallet: string): Promise<IssuerInfo>`
- `postMetadata(hash: string, metadata: object): Promise<{ok: boolean}>`
- `batchPreview(csv: string): Promise<{rows, errors}>`
- `getEvents(params?): Promise<{events, cursor}>`

### Hashing

- `buildCredentialMetadata(payload): CredentialMetadata` — currently adds `proofmint_version` and a generated `created_at` value
- `hashCredentialMetadata(payload): string` — SHA-256 hex digest of the SDK's canonicalized metadata
- `verifyMetadataHash(payload, expectedHash): boolean` — validates a hash match

The metadata hashing format is an interoperability boundary. Use the SDK helper and shared fixtures rather than implementing a second serializer in an application. The API's current prototype endpoint expects the submitted hash to match the JSON bytes it receives.

## Configuration

`ProofMintConfig` is explicit so the SDK can run in a browser, server, or CLI without depending on `NEXT_PUBLIC_*` globals:

| Field | Purpose |
|---|---|
| `network` | `testnet` or `mainnet` |
| `rpcUrl` | Stellar RPC endpoint |
| `contractId` | Deployed ProofMint contract ID |
| `apiUrl` | Optional ProofMint API base URL |
| `networkPassphrase` | Stellar transaction/network passphrase |

## Development

```bash
npm install
npm run build
npm run typecheck
```

The package currently builds and typechecks without requiring a deployed contract. RPC-backed reads require a valid contract ID and a reachable Stellar RPC endpoint.

## Related Repositories

- `proofmint-contracts` defines the contract ABI and authoritative credential state.
- `proofmint-indexer` supplies the data projected behind the API.
- `proofmint-api` serves off-chain metadata and indexed views.
- `proofmint-web` is the reference issuer/verifier frontend.

## License

Apache-2.0
