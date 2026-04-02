// frontend/lib/contracts/types.ts
/**
 * TypeScript types for Aidvocate Dispute Resolution contract
 */

export interface Dispute {
  id: string;
  plaintiff: string;
  defendant: string;
  amount: string;
  evidence_cid: string;
  description: string;
  status: number; // 0=PENDING, 1=UNDER_REVIEW, 2=RESOLVED, 3=APPEALED
  resolution: number; // 0=NOT_RESOLVED, 1=PLAINTIFF_WINS, 2=DEFENDANT_WINS
  created_at: number;
  resolved_at: number;
  appeal_deadline: number;
  validator_count: number;
  confidence_score: number;
  owner: string;
}

export interface Evidence {
  cid: string;
  evidence_type: string;
  description: string;
  timestamp: number;
  submitter: string;
}

export interface ContractStats {
  total_disputes: number;
  resolved: number;
  appealed: number;
  pending: number;
  contract_version: string;
  dev_fee_rate: number;
}

export interface LeaderboardEntry {
  address: string;
  points: number;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  transactionHash?: string;
  blockNumber?: number;
  logs?: any[];
  [key: string]: any;
}