"use client";

import { Scale, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useDisputes, useContractConfig } from "@/lib/hooks/useAidvocate";
import { useWallet } from "@/lib/genlayer/wallet";
import { Loader2 } from "lucide-react";

export function StatsPanel() {
  const { data: disputes, isLoading } = useDisputes();
  const { data: config } = useContractConfig();
  const { address } = useWallet();

  if (isLoading) {
    return (
      <div className="brand-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  const total = disputes?.length || 0;
  const pending = disputes?.filter(d => d.status === "pending").length || 0;
  const resolved = disputes?.filter(d => d.status === "resolved").length || 0;
  const finalized = disputes?.filter(d => d.status === "finalized").length || 0;
  const appealed = disputes?.filter(d => d.isAppealed).length || 0;

  const myDisputes = disputes?.filter(
    d => d.creator === address || d.respondent === address
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Contract Info */}
      <div className="brand-card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Protocol Stats
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Total Cases</span>
            <span className="text-2xl font-bold">{total}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">{pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{resolved}</div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{finalized}</div>
              <div className="text-xs text-muted-foreground">Finalized</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">{appealed}</div>
              <div className="text-xs text-muted-foreground">Appealed</div>
            </div>
          </div>
        </div>
      </div>

      {/* My Activity */}
      {address && (
        <div className="brand-card p-6">
          <h3 className="text-lg font-bold mb-4">Your Activity</h3>
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
            <span className="text-sm">Your Cases</span>
            <span className="text-xl font-bold text-accent">{myDisputes}</span>
          </div>
        </div>
      )}

      {/* Fees */}
      {config && (
        <div className="brand-card p-6">
          <h3 className="text-lg font-bold mb-4">Fee Structure</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Validator Fee</span>
              <span>{(config.validatorFeePercent / 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min Escrow</span>
              <span>{(Number(config.minEscrow) / 1e18).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appeal Cost</span>
              <span>{(Number(config.appealCost) / 1e18).toFixed(4)} ETH</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}