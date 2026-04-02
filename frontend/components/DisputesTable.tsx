"use client";

import { Loader2, Scale, Clock, CheckCircle, AlertCircle, FileText, Upload } from "lucide-react";
import { useDisputes, useResolveDispute, useAidvocateContract } from "@/lib/hooks/useAidvocate";
import { useWallet } from "@/lib/genlayer/wallet";
import { error } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CreateDisputeModal } from "./CreateDisputeModal";
import { AppealModal } from "./AppealModal";
import type { Dispute } from "@/lib/contracts/types";

export function DisputesTable() {
  const contract = useAidvocateContract();
  const { data: disputes, isLoading, isError } = useDisputes();
  const { address, isConnected } = useWallet();
  const { resolveDispute, isResolving, resolvingId } = useResolveDispute();

  const handleResolve = (disputeId: string) => {
    if (!address) {
      error("Please connect your wallet");
      return;
    }
    const confirmed = confirm("Initiate AI resolution? This will trigger validator consensus.");
    if (confirmed) resolveDispute(disputeId);
  };

  if (isLoading) {
    return (
      <div className="brand-card p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading disputes...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-12 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-yellow-400 opacity-60 mb-4" />
        <h3 className="text-xl font-bold mb-2">Setup Required</h3>
        <p className="text-muted-foreground">
          Set <code className="bg-muted px-2 py-1 rounded text-xs">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in your .env file
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="brand-card p-8 text-center">
        <p className="text-destructive">Failed to load disputes. Please try again.</p>
      </div>
    );
  }

  if (!disputes || disputes.length === 0) {
    return (
      <div className="brand-card p-12">
        <div className="text-center space-y-4">
          <Scale className="w-16 h-16 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-bold">No Disputes Yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to create a dispute and experience AI-powered resolution
          </p>
          <CreateDisputeModal />
        </div>
      </div>
    );
  }

  return (
    <div className="brand-card p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Scale className="w-5 h-5 text-accent" />
          Active Disputes
        </h2>
        <CreateDisputeModal />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Case ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Parties
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Escrow
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {disputes.map((dispute) => (
              <DisputeRow
                key={dispute.id}
                dispute={dispute}
                currentAddress={address}
                isConnected={isConnected}
                onResolve={handleResolve}
                isResolving={isResolving && resolvingId === dispute.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface DisputeRowProps {
  dispute: Dispute;
  currentAddress: string | null;
  isConnected: boolean;
  onResolve: (id: string) => void;
  isResolving: boolean;
}

function DisputeRow({ dispute, currentAddress, isConnected, onResolve, isResolving }: DisputeRowProps) {
  const isCreator = currentAddress?.toLowerCase() === dispute.creator?.toLowerCase();
  const isRespondent = currentAddress?.toLowerCase() === dispute.respondent?.toLowerCase();
  const isInvolved = isCreator || isRespondent;
  const canResolve = isConnected && dispute.status === "pending";
  const canAppeal = isConnected && isInvolved && dispute.status === "resolved" && !dispute.isAppealed;

  const getStatusBadge = () => {
    switch (dispute.status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      case "appealed":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Appealed
          </Badge>
        );
      case "finalized":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Scale className="w-3 h-3 mr-1" />
            Finalized
          </Badge>
        );
      default:
        return <Badge variant="outline">{dispute.status}</Badge>;
    }
  };

  const formatEscrow = (amount: string) => {
    const eth = Number(amount) / 1e18;
    return `${eth.toFixed(4)} ETH`;
  };

  return (
    <tr className="group hover:bg-white/5 transition-colors">
      <td className="px-4 py-4">
        <code className="text-xs font-mono text-muted-foreground">
          {dispute.id.slice(0, 16)}...
        </code>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Creator:</span>
            <AddressDisplay address={dispute.creator} maxLength={8} />
            {isCreator && <Badge variant="secondary" className="text-xs">You</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Respondent:</span>
            <AddressDisplay address={dispute.respondent} maxLength={8} />
            {isRespondent && <Badge variant="secondary" className="text-xs">You</Badge>}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm max-w-xs truncate" title={dispute.description}>
          {dispute.description}
        </p>
        <a 
          href={`https://gateway.pinata.cloud/ipfs/${dispute.evidenceCid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
        >
          <FileText className="w-3 h-3" />
          View Evidence
        </a>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-2">
          {getStatusBadge()}
          {dispute.resolution && (
            <div className="text-xs text-muted-foreground">
              Winner: <span className="text-accent font-semibold capitalize">{dispute.resolution}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-semibold">{formatEscrow(dispute.escrowAmount)}</span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {canResolve && (
            <Button
              onClick={() => onResolve(dispute.id)}
              disabled={isResolving}
              size="sm"
              variant="gradient"
            >
              {isResolving ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Resolve"
              )}
            </Button>
          )}
          {canAppeal && (
            <AppealModal dispute={dispute} />
          )}
          {dispute.isAppealed && (
            <Badge variant="outline" className="text-xs">
              {dispute.appealCount} appeal(s)
            </Badge>
          )}
        </div>
      </td>
    </tr>
  );
}