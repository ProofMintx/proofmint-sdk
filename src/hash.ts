import { hash as sha256 } from "@stablelib/sha256";
import type { CredentialMetadata } from "./types.js";

function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);

  const record = obj as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    sorted[key] = sortObjectKeys(record[key]);
  }
  return sorted;
}

function canonicalJson(payload: CredentialMetadata): string {
  const sorted = sortObjectKeys(payload);
  return JSON.stringify(sorted);
}

export function buildCredentialMetadata(payload: CredentialMetadata): CredentialMetadata {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new Error("metadata must be a non-null JSON object");
  }
  const now = new Date().toISOString();
  return {
    ...payload,
    proofmint_version: "1",
    created_at: now,
  };
}

export function hashCredentialMetadata(payload: CredentialMetadata): string {
  const built = buildCredentialMetadata(payload);
  const json = canonicalJson(built);
  const bytes = new TextEncoder().encode(json);
  const digest = sha256(bytes);
  return Array.from(digest)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function verifyMetadataHash(
  payload: CredentialMetadata,
  expectedHash: string,
): boolean {
  const computed = hashCredentialMetadata(payload);
  return computed === expectedHash.toLowerCase();
}
