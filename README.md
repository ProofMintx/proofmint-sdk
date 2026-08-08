# ProofMint SDK

TypeScript SDK for verifiable credential operations on Stellar.

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

- `buildCredentialMetadata(payload): CredentialMetadata` — adds proofmint_version and created_at
- `hashCredentialMetadata(payload): string` — canonical SHA-256 hex digest
- `verifyMetadataHash(payload, expectedHash): boolean` — validate hash match

## Development

```bash
npm install
npm run build
npm run typecheck
```

## License

Apache-2.0
