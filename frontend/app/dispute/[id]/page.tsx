// frontend/app/dispute/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDispute, useEvidence, useAppeal } from "@/lib/hooks/useAidvocate";
import { useWallet } from "@/lib/genlayer/wallet";
import { SubmitEvidenceModal } from "@/components/SubmitEvidenceModal";
import { AppealButton } from "@/components/AppealButton";
import { getIPFSUrl } from "@/lib/utils/pinata";
import { Loader2, Scale, CheckCircle, XCircle, Clock, FileText, ExternalLink, AlertCircle } from "lucide-react";

export default function DisputePage() {
  const { id } = useParams();
  const disputeId = id as string;
  const { address } = useWallet();
  const { data: dispute, isLoading: disputeLoading } = useDispute(disputeId);
  const { data: evidence = [], isLoading: evidenceLoading } = useEvidence(disputeId);
  const { mutate: appeal, isPending: isAppealing } = useAppeal();

  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleString();
  const formatAmount = (amount: string) => (parseInt(amount) / 1e18).toFixed(2);

  const getStatus = (status: number) => {
    const statusMap: Record<number, { text: string; color: string; icon: React.ReactNode }> = {
      0: { text: "Pending", color: "text-yellow-400", icon: <Clock className="w-5 h-5" /> },
      1: { text: "Under Review", color: "text-blue-400", icon: <Loader2 className="w-5 h-5 animate-spin" /> },
      2: { text: "Resolved", color: "text-green-400", icon: <CheckCircle className="w-5 h-5" /> },
      3: { text: "Appealed", color: "text-purple-400", icon: <Scale className="w-5 h-5" /> },
    };
    return statusMap[status] || { text: "Unknown", color: "text-gray-400", icon: <AlertCircle className="w-5 h-5" /> };
  };

  const getResolution = (resolution: number) => {
    if (resolution === 1) return { text: "Plaintiff Wins", color: "text-green-400" };
    if (resolution === 2) return { text: "Defendant Wins", color: "text-red-400" };
    return { text: "Not Resolved", color: "text-gray-400" };
  };

  const isUserInvolved = address && dispute && (dispute.plaintiff === address || dispute.defendant === address);
  const canAppeal = dispute?.status === 2 && isUserInvolved && Date.now() / 1000 < dispute.appeal_deadline;

  if (disputeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Scale className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Dispute Not Found</h1>
          <p className="text-muted-foreground">The dispute you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="btn-primary mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  const status = getStatus(dispute.status);
  const resolution = getResolution(dispute.resolution);
  const isPlaintiff = address === dispute.plaintiff;
  const isDefendant = address === dispute.defendant;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-accent hover:underline text-sm">← Back to Dashboard</Link>
        </div>
        
        {/* Dispute Header */}
        <div className="brand-card p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dispute #{dispute.id.slice(-8)}</h1>
              <p className="text-muted-foreground mt-1">Created {formatDate(dispute.created_at)}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.color} bg-current/10`}>
              {status.icon}
              <span className="text-sm font-medium">{status.text}</span>
            </div>
          </div>
        </div>
        
        {/* Dispute Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="brand-card p-6">
            <h3 className="font-semibold mb-3">Parties</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Plaintiff</p>
                <p className="font-mono text-sm break-all">{dispute.plaintiff}</p>
                {isPlaintiff && <span className="text-xs text-accent mt-1 inline-block">(You)</span>}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Defendant</p>
                <p className="font-mono text-sm break-all">{dispute.defendant}</p>
                {isDefendant && <span className="text-xs text-accent mt-1 inline-block">(You)</span>}
              </div>
            </div>
          </div>
          
          <div className="brand-card p-6">
            <h3 className="font-semibold mb-3">Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Amount at Stake</p>
                <p className="text-2xl font-bold text-accent">{formatAmount(dispute.amount)} GEN</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Validators</p>
                <p>{dispute.validator_count} AI Validators</p>
              </div>
              {dispute.confidence_score > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Confidence Score</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${dispute.confidence_score}%` }} />
                  </div>
                  <p className="text-xs mt-1">{dispute.confidence_score}%</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="brand-card p-6 mb-6">
          <h3 className="font-semibold mb-3">Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{dispute.description}</p>
        </div>
        
        {/* Evidence */}
        <div className="brand-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Evidence</h3>
            {isUserInvolved && dispute.status === 1 && <SubmitEvidenceModal disputeId={disputeId} />}
          </div>
          
          {evidenceLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : evidence.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No evidence submitted yet</p>
          ) : (
            <div className="space-y-3">
              {evidence.map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-sm font-medium">{ev.evidence_type}</p>
                      <p className="text-xs text-muted-foreground">{ev.description}</p>
                    </div>
                  </div>
                  <a href={getIPFSUrl(ev.cid)} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm flex items-center gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Resolution */}
        {dispute.status === 2 && (
          <div className="brand-card p-6 mb-6">
            <h3 className="font-semibold mb-3">Resolution</h3>
            <div className={`text-center p-4 rounded-lg ${resolution.color} bg-current/10`}>
              <p className="text-lg font-bold">{resolution.text}</p>
              {dispute.resolved_at > 0 && <p className="text-sm mt-1">Resolved on {formatDate(dispute.resolved_at)}</p>}
            </div>
            
            {canAppeal && (
              <div className="mt-4 text-center">
                <AppealButton 
                  disputeId={disputeId} 
                  deadline={dispute.appeal_deadline} 
                  onAppeal={() => appeal(disputeId)} 
                  isAppealing={isAppealing} 
                />
                <p className="text-xs text-muted-foreground mt-2">Appeal deadline: {formatDate(dispute.appeal_deadline)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}