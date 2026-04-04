// frontend/lib/contracts/Aidvocate.ts
import { createClient } from "genlayer-js";
import { testnetBradbury, studionet } from "genlayer-js/chains";
import type { Dispute, Evidence, ContractStats, LeaderboardEntry } from "./types";

/**
 * Aidvocate contract class for interacting with the GenLayer Dispute Resolution contract
 */
export class Aidvocate {
  private client: ReturnType<typeof createClient>;
  private address: `0x${string}`;
  private rpcUrl: string;

  constructor(contractAddress: string, account?: string | null, rpcUrl?: string) {
    this.address = contractAddress as `0x${string}`;
    this.rpcUrl = rpcUrl || "https://rpc-bradbury.genlayer.com";
    
    const config: any = {
      chain: testnetBradbury,
      endpoint: this.rpcUrl,
    };
    
    if (account) {
      config.account = account as `0x${string}`;
    }
    
    this.client = createClient(config);
  }

// frontend/lib/contracts/Aidvocate.ts

/**
 * Create a new dispute
 */
async createDispute(
  defendant: string,
  description: string,
  evidenceCID: string,
  amountWei: string
): Promise<{ disputeId: string; txHash: string }> {
  try {
    // Validate inputs
    if (!defendant || !defendant.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid defendant address");
    }
    if (!description || description.length < 10) {
      throw new Error("Description must be at least 10 characters");
    }
    if (!evidenceCID) {
      throw new Error("Evidence CID is required");
    }
    const amount = BigInt(amountWei);
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    console.log("📝 Creating dispute with params:");
    console.log("   Defendant:", defendant);
    console.log("   Description:", description.substring(0, 50) + "...");
    console.log("   Evidence CID:", evidenceCID);
    console.log("   Amount (wei):", amount.toString());

    // Call the contract
    const txHash = await this.client.writeContract({
      address: this.address,
      functionName: "create_dispute",
      args: [defendant, description, evidenceCID],
      value: amount,
      // Add gas limit to avoid estimation issues
      //gas: 5000000n,
    });

    console.log("   Transaction sent:", txHash);

    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 60,
      interval: 5000,
    });

    console.log("   Receipt status:", receipt.statusName);

    // Extract dispute ID from events or generate one
    let disputeId = "";
    

    
    // If no event, generate a temporary ID (will be replaced when fetching from chain)
    if (!disputeId) {
      disputeId = `0x${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.warn("   No dispute ID in events, using generated ID:", disputeId);
    }

    // Store the dispute ID locally
    this.storeDisputeId(disputeId);
    
    return { disputeId, txHash: receipt.hash || txHash };
  } catch (error) {
    console.error("Error creating dispute:", error);
    throw error;
  }
}

  /**
   * Store dispute ID in localStorage for retrieval
   */
  private storeDisputeId(disputeId: string): void {
    try {
      if (typeof window !== 'undefined') {
        const existingIds = localStorage.getItem('myDisputes');
        const ids = existingIds ? JSON.parse(existingIds) : [];
        if (!ids.includes(disputeId)) {
          ids.push(disputeId);
          localStorage.setItem('myDisputes', JSON.stringify(ids));
        }
      }
    } catch (error) {
      console.error('Error storing dispute ID:', error);
    }
  }

  /**
   * Submit additional evidence
   */
  async submitEvidence(
    disputeId: string,
    cid: string,
    evidenceType: string,
    description: string
  ): Promise<string> {
    try {
      const txHash = await this.client.writeContract({
        address: this.address,
        functionName: "submit_evidence",
        args: [disputeId, cid, evidenceType, description],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 30,
        interval: 5000,
      });

      return receipt.hash || txHash;
    } catch (error) {
      console.error("Error submitting evidence:", error);
      throw error;
    }
  }

  /**
   * Appeal a dispute resolution
   */
  async appeal(disputeId: string): Promise<string> {
    try {
      const txHash = await this.client.writeContract({
        address: this.address,
        functionName: "appeal",
        args: [disputeId],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 30,
        interval: 5000,
      });

      return receipt.hash || txHash;
    } catch (error) {
      console.error("Error appealing dispute:", error);
      throw error;
    }
  }

  /**
   * Get a dispute by ID
   */
  async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      const dispute = await this.client.readContract({
        address: this.address,
        functionName: "get_dispute",
        args: [disputeId],
      });
      
      if (!dispute) return null;
      
      // Parse the dispute data
      return {
        id: (dispute as any).id || disputeId,
        plaintiff: (dispute as any).plaintiff || "",
        defendant: (dispute as any).defendant || "",
        amount: (dispute as any).amount?.toString() || "0",
        evidence_cid: (dispute as any).evidence_cid || "",
        description: (dispute as any).description || "",
        status: Number((dispute as any).status || 0),
        resolution: Number((dispute as any).resolution || 0),
        created_at: Number((dispute as any).created_at || 0),
        resolved_at: Number((dispute as any).resolved_at || 0),
        appeal_deadline: Number((dispute as any).appeal_deadline || 0),
        validator_count: Number((dispute as any).validator_count || 5),
        confidence_score: Number((dispute as any).confidence_score || 0),
        owner: (dispute as any).owner || (dispute as any).plaintiff || ""
      };
    } catch (error) {
      console.error("Error fetching dispute:", error);
      return null;
    }
  }

  /**
   * Get all evidence for a dispute
   */
  async getEvidence(disputeId: string): Promise<Evidence[]> {
    try {
      const evidence = await this.client.readContract({
        address: this.address,
        functionName: "get_evidence",
        args: [disputeId],
      });
      
      if (Array.isArray(evidence)) {
        return evidence.map((item: any) => ({
          cid: item.cid || "",
          evidence_type: item.evidence_type || item.type || "",
          description: item.description || "",
          timestamp: Number(item.timestamp || 0),
          submitter: item.submitter || ""
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching evidence:", error);
      return [];
    }
  }

  /**
   * DISABLED: Get all disputes for a party - Contract has bug with DynArray
   * TODO: Re-enable after contract fix
   */
  /*
  async getDisputesByParty(party: string): Promise<Dispute[]> {
    try {
      const disputes = await this.client.readContract({
        address: this.address,
        functionName: "get_disputes_by_party",
        args: [party],
      });
      
      if (Array.isArray(disputes)) {
        return disputes.map((item: any) => ({
          id: item.id || "",
          plaintiff: item.plaintiff || "",
          defendant: item.defendant || "",
          amount: item.amount?.toString() || "0",
          evidence_cid: item.evidence_cid || "",
          description: item.description || "",
          status: Number(item.status || 0),
          resolution: Number(item.resolution || 0),
          created_at: Number(item.created_at || 0),
          resolved_at: Number(item.resolved_at || 0),
          appeal_deadline: Number(item.appeal_deadline || 0),
          validator_count: Number(item.validator_count || 5),
          confidence_score: Number(item.confidence_score || 0),
          owner: item.owner || item.plaintiff || ""
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching disputes:", error);
      return [];
    }
  }
  */

  /**
   * Get player points
   */
  async getPlayerPoints(address: string): Promise<number> {
    try {
      const points = await this.client.readContract({
        address: this.address,
        functionName: "get_player_points",
        args: [address],
      });
      return Number(points) || 0;
    } catch (error) {
      console.error("Error fetching player points:", error);
      return 0;
    }
  }

  /**
   * Get all points (leaderboard)
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const points: any = await this.client.readContract({
        address: this.address,
        functionName: "get_points",
        args: [],
      });

      if (points instanceof Map) {
        return Array.from(points.entries())
          .map(([addr, pts]: [any, any]) => ({
            address: typeof addr === 'string' ? addr : addr.as_hex || String(addr),
            points: Number(pts),
          }))
          .sort((a, b) => b.points - a.points);
      }
      
      if (typeof points === 'object' && points !== null) {
        return Object.entries(points)
          .map(([addr, pts]) => ({
            address: addr,
            points: Number(pts),
          }))
          .sort((a, b) => b.points - a.points);
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  }

  /**
   * Get contract statistics
   */
async getStats(): Promise<ContractStats | null> {
  try {
    console.log('📊 [Aidvocate] Fetching contract stats...');
    console.log('   Contract address:', this.address);
    console.log('   RPC URL:', this.rpcUrl);
    
    const statsJson = await this.client.readContract({
      address: this.address,
      functionName: "get_stats",
      args: [],
    });
    
    console.log('✅ [Aidvocate] Stats received:', statsJson);
    
    if (!statsJson) return null;
    
    const stats = typeof statsJson === 'string' ? JSON.parse(statsJson) : statsJson;
    return {
      total_disputes: Number(stats.total_disputes) || 0,
      resolved: Number(stats.resolved) || 0,
      appealed: Number(stats.appealed) || 0,
      pending: Number(stats.pending) || 0,
      contract_version: stats.contract_version || "1.0.0",
      dev_fee_rate: Number(stats.dev_fee_rate) || 20
    };
  } catch (error) {
    console.error('❌ [Aidvocate] Error fetching stats:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

  /**
   * Update the account for transactions
   */
  updateAccount(address: string): void {
    const config: any = {
      chain: testnetBradbury,
      endpoint: this.rpcUrl,
      account: address as `0x${string}`,
    };
    this.client = createClient(config);
  }

  /**
   * Get status text for display
   */
  getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: "Pending Review",
      1: "Under Review",
      2: "Resolved",
      3: "Appealed"
    };
    return statusMap[status] || "Unknown";
  }

  /**
   * Get resolution text for display
   */
  getResolutionText(resolution: number): string {
    const resolutionMap: Record<number, string> = {
      0: "Not Resolved",
      1: "Plaintiff Wins",
      2: "Defendant Wins"
    };
    return resolutionMap[resolution] || "Unknown";
  }
}

export default Aidvocate;