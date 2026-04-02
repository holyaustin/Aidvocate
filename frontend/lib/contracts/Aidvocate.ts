import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Dispute, ContractConfig, TransactionReceipt } from "./types";

/**
 * Aidvocate - AI-Powered Dispute Resolution Oracle
 * Contract class for interacting with the GenLayer dispute resolution contract
 */
class Aidvocate {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;

    const config: any = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (studioUrl) {
      config.endpoint = studioUrl;
    }

    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    const config: any = {
      chain: studionet,
      account: address as `0x${string}`,
    };
    this.client = createClient(config);
  }

  /**
   * Create a new dispute with escrow
   */
  async createDispute(
    respondent: string,
    description: string,
    evidenceCid: string,
    escrowAmount: string
  ): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "create_dispute",
      args: [respondent, description, evidenceCid],
      value: BigInt(escrowAmount),
    });

    return await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 24,
      interval: 5000,
    }) as TransactionReceipt;
  }

  /**
   * Resolve a dispute using AI consensus
   */
  async resolveDispute(disputeId: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "resolve_dispute",
      args: [disputeId],
      value: BigInt(0),
    });

    return await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 24,
      interval: 5000,
    }) as TransactionReceipt;
  }

  /**
   * Appeal a resolved dispute with new evidence
   */
  async appealDispute(
    disputeId: string,
    newEvidenceCid: string,
    appealCost: string
  ): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "appeal_dispute",
      args: [disputeId, newEvidenceCid],
      value: BigInt(appealCost),
    });

    return await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 24,
      interval: 5000,
    }) as TransactionReceipt;
  }

  /**
   * Get dispute details
   */
  async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_dispute",
        args: [disputeId],
      });
      
      if (!result || Object.keys(result).length === 0) return null;
      return this.parseDispute(result);
    } catch (error) {
      console.error("Error fetching dispute:", error);
      return null;
    }
  }

  /**
   * Get all disputes for a user
   */
  async getUserDisputes(address: string | null): Promise<Dispute[]> {
    if (!address) return [];
    
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_user_disputes",
        args: [address],
      });
      
      if (!Array.isArray(result)) return [];
      return result.map((d: any) => this.parseDispute(d)).filter(Boolean) as Dispute[];
    } catch (error) {
      console.error("Error fetching user disputes:", error);
      return [];
    }
  }

  /**
   * Get all disputes
   */
  async getAllDisputes(): Promise<Dispute[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_all_disputes",
        args: [],
      });
      
      if (!Array.isArray(result)) return [];
      return result.map((d: any) => this.parseDispute(d)).filter(Boolean) as Dispute[];
    } catch (error) {
      console.error("Error fetching all disputes:", error);
      return [];
    }
  }

  /**
   * Get contract configuration
   */
  async getContractConfig(): Promise<ContractConfig | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_contract_config",
        args: [],
      });
      
      return {
        validatorFeePercent: result.validator_fee_percent,
        minEscrow: result.min_escrow,
        appealCost: result.appeal_cost,
      };
    } catch (error) {
      console.error("Error fetching config:", error);
      return null;
    }
  }

  private parseDispute(data: any): Dispute | null {
    if (!data || !data.id) return null;
    
    return {
      id: data.id,
      creator: data.creator,
      respondent: data.respondent,
      description: data.description,
      evidenceCid: data.evidence_cid,
      escrowAmount: data.escrow_amount,
      status: data.status as "pending" | "resolved" | "appealed" | "finalized",
      resolution: data.resolution,
      resolutionReason: data.resolution_reason,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at,
      appealCount: data.appeal_count,
      isAppealed: data.is_appealed,
    };
  }
}

export default Aidvocate;