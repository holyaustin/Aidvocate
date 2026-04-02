"use client";

import Link from "next/link";
import { Dispute } from "@/lib/contracts/types";

interface DisputeCardProps {
  dispute: Dispute;
  userAddress?: string;
}

export function DisputeCard({ dispute, userAddress }: DisputeCardProps) {
  const isUserInvolved = userAddress && 
    (dispute.plaintiff.toLowerCase() === userAddress.toLowerCase() ||
     dispute.defendant.toLowerCase() === userAddress.toLowerCase());
  
  const userIsPlaintiff = userAddress && 
    dispute.plaintiff.toLowerCase() === userAddress.toLowerCase();
  
  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0: return "text-yellow-400 border-yellow-500/30";
      case 1: return "text-blue-400 border-blue-500/30";
      case 2: return "text-green-400 border-green-500/30";
      case 3: return "text-purple-400 border-purple-500/30";
      default: return "text-gray-400 border-gray-500/30";
    }
  };
  
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0: return "Pending";
      case 1: return "Under Review";
      case 2: return "Resolved";
      case 3: return "Appealed";
      default: return "Unknown";
    }
  };
  
  const getResolutionText = (resolution: number): string | null => {
    if (resolution === 1) return "Plaintiff Wins";
    if (resolution === 2) return "Defendant Wins";
    return null;
  };
  
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };
  
  const formatAmount = (amount: string): string => {
    return (parseInt(amount) / 1e18).toFixed(2);
  };
  
  const canAppeal = dispute.status === 2 && Date.now() / 1000 < dispute.appeal_deadline && isUserInvolved;
  
  return (
    <Link href={`/dispute/${dispute.id}`}>
      <div className="brand-card p-6 hover:brand-card-hover transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">Dispute #{dispute.id.slice(-8)}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {dispute.description.substring(0, 100)}...
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
            {getStatusText(dispute.status)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Plaintiff:</span>
            <p className="font-mono text-xs">{dispute.plaintiff.slice(0, 10)}...{dispute.plaintiff.slice(-6)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Defendant:</span>
            <p className="font-mono text-xs">{dispute.defendant.slice(0, 10)}...{dispute.defendant.slice(-6)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <p className="font-bold text-accent">{formatAmount(dispute.amount)} GEN</p>
          </div>
          <div>
            <span className="text-muted-foreground">Created:</span>
            <p>{formatDate(dispute.created_at)}</p>
          </div>
        </div>
        
        {dispute.status === 2 && dispute.resolution > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span>
                <span className="text-muted-foreground">Outcome:</span>
                <span className={`ml-2 font-bold ${
                  (dispute.resolution === 1 && userIsPlaintiff) ||
                  (dispute.resolution === 2 && !userIsPlaintiff)
                    ? "text-green-400" : "text-red-400"
                }`}>
                  {getResolutionText(dispute.resolution)}
                </span>
              </span>
              {dispute.confidence_score > 0 && (
                <span>
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="ml-1 font-bold text-accent">{dispute.confidence_score}%</span>
                </span>
              )}
            </div>
          </div>
        )}
        
        {canAppeal && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex justify-between items-center text-sm">
              <span className="text-yellow-400">⚖️ Appeal available until {formatDate(dispute.appeal_deadline)}</span>
              <span className="text-accent">Click to appeal →</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}