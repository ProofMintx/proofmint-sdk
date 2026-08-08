export type StellarNetwork = "testnet" | "mainnet";

export interface ProofMintConfig {
  network: StellarNetwork;
  rpcUrl: string;
  contractId: string;
  apiUrl?: string;
  networkPassphrase: string;
}

export enum CredentialStatus {
  Active = "Active",
  Expired = "Expired",
  Revoked = "Revoked",
  NotFound = "NotFound",
}

export interface Credential {
  id: bigint;
  issuer: string;
  recipient: string;
  metadata_hash: string;
  issued_at: bigint;
  expires_at: bigint | null;
  revoked_at: bigint | null;
}

export type CredentialMetadata = Record<string, unknown>;

export interface IssuerInfo {
  wallet: string;
  is_registered: boolean;
}

export interface VerifyResult {
  credential_id: bigint;
  status: CredentialStatus;
  issuer: string;
  recipient: string;
  metadata_hash: string;
  issued_at: bigint;
  expires_at: bigint | null;
}

export interface ApiCredential {
  id: string;
  issuer: string;
  recipient: string;
  metadata_hash: string;
  issued_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  status: CredentialStatus;
  metadata?: CredentialMetadata;
}

export interface ApiError {
  error: string;
  message?: string;
}
