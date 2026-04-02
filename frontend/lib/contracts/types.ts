/**
 * TypeScript types for Aidvocate Dispute Resolution contract
 */

export interface Dispute {
  id: string;
  creator: string;
  respondent: string;
  description: string;
  evidenceCid: string;
  escrowAmount: string;
  status: "pending" | "resolved" | "appealed" | "finalized";
  resolution: string;
  resolutionReason: string;
  createdAt: string;
  resolvedAt: string;
  appealCount: number;
  isAppealed: boolean;
}

export interface ContractConfig {
  validatorFeePercent: number;
  minEscrow: string;
  appealCost: string;
}

export interface LeaderboardEntry {
  address: string;
  points: number;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}

export interface EvidenceFile {
  file: File;
  cid?: string;
  uploading?: boolean;
  error?: string;
}