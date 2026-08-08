import * as StellarSdk from "@stellar/stellar-sdk";
import type { ProofMintConfig, Credential, CredentialStatus } from "./types.js";

export class ProofMintContract {
  readonly config: ProofMintConfig;
  readonly rpc: StellarSdk.rpc.Server;

  constructor(config: ProofMintConfig) {
    this.config = config;
    this.rpc = new StellarSdk.rpc.Server(config.rpcUrl);
  }

  private async simulate(
    method: string,
    args: StellarSdk.xdr.ScVal[],
  ): Promise<StellarSdk.xdr.ScVal> {
    const contract = new StellarSdk.Contract(this.config.contractId);
    const source = new StellarSdk.Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0",
    );

    const tx = new StellarSdk.TransactionBuilder(source, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(sim)) {
      throw new Error(`Contract simulation error: ${sim.error}`);
    }

    return sim.result!.retval;
  }

  async verifyCredential(credentialId: bigint): Promise<CredentialStatus> {
    const retval = await this.simulate("verify_credential", [
      StellarSdk.nativeToScVal(credentialId, { type: "u64" }),
    ]);
    const status = StellarSdk.scValToNative(retval) as string;
    return status as CredentialStatus;
  }

  async getCredential(credentialId: bigint): Promise<Credential | null> {
    const retval = await this.simulate("get_credential", [
      StellarSdk.nativeToScVal(credentialId, { type: "u64" }),
    ]);

    const native = StellarSdk.scValToNative(retval);
    if (native === null || native === undefined) return null;

    const raw = native as Record<string, unknown>;
    if (!raw || Object.keys(raw).length === 0) return null;

    return {
      id: BigInt(raw.id as string | number),
      issuer: raw.issuer as string,
      recipient: raw.recipient as string,
      metadata_hash: raw.metadata_hash as string,
      issued_at: BigInt(raw.issued_at as string | number),
      expires_at: raw.expires_at != null ? BigInt(raw.expires_at as string | number) : null,
      revoked_at: raw.revoked_at != null ? BigInt(raw.revoked_at as string | number) : null,
    };
  }

  async isIssuer(wallet: string): Promise<boolean> {
    const retval = await this.simulate("is_issuer", [
      new StellarSdk.Address(wallet).toScVal(),
    ]);
    return StellarSdk.scValToNative(retval) as boolean;
  }

  async getAdmin(): Promise<string> {
    const retval = await this.simulate("get_admin", []);
    return StellarSdk.scValToNative(retval) as string;
  }
}
