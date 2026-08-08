import type { ProofMintConfig, ApiCredential, ApiError, IssuerInfo } from "./types.js";

export class ProofMintApi {
  readonly config: ProofMintConfig;
  private baseUrl: string;

  constructor(config: ProofMintConfig) {
    this.config = config;
    this.baseUrl = (config.apiUrl ?? "http://localhost:3001").replace(/\/$/, "");
  }

  private async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiError | null;
      throw new Error(body?.message ?? body?.error ?? `API error ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  async getCredential(id: string): Promise<ApiCredential> {
    return this.request<ApiCredential>(`/credentials/${encodeURIComponent(id)}`);
  }

  async verifyCredential(id: string): Promise<ApiCredential> {
    return this.request<ApiCredential>(`/verify/${encodeURIComponent(id)}`);
  }

  async getIssuer(wallet: string): Promise<IssuerInfo> {
    return this.request<IssuerInfo>(`/issuers/${encodeURIComponent(wallet)}`);
  }

  async postMetadata(hash: string, metadata: Record<string, unknown>): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>("/metadata", {
      method: "POST",
      body: JSON.stringify({ hash, metadata }),
    });
  }

  async batchPreview(csv: string): Promise<{ rows: Record<string, unknown>[]; errors: string[] }> {
    return this.request("/batch-preview", {
      method: "POST",
      body: JSON.stringify({ csv }),
    });
  }

  async getEvents(params?: { limit?: number; cursor?: string }): Promise<{
    events: unknown[];
    cursor: string | null;
  }> {
    const search = new URLSearchParams();
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.cursor) search.set("cursor", params.cursor);
    const qs = search.toString();
    return this.request(`/events${qs ? `?${qs}` : ""}`);
  }
}
