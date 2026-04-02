// frontend/app/components/DisputeCard.tsx
"use client";

import Link from "next/link";
import { Scale, Clock, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { AddressDisplay } from "./AddressDisplay";

interface DisputeCardProps {
  dispute: any;
  userAddress?: string;
}

export function DisputeCard({ dispute, userAddress }: DisputeCardProps) {
  const formatAmount = (amount: string) => (parseInt(amount) / 1e18).toFixed(2);
  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString();
  
  const getStatusConfig = (status: number) => {
    switch (status) {
      case 0: return { text: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Clock };
      case 1: return { text: "Under Review", color: "text-blue-400", bg: "bg-blue-400/10", icon: Scale };
      case 2: return { text: "Resolved", color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle };
      case 3: return { text: "Appealed", color: "text-purple-400", bg: "bg-purple-400/10", icon: AlertCircle };
      default: return { text: "Unknown", color: "text-gray-400", bg: "bg-gray-400/10", icon: Scale };
    }
  };
  
  const statusConfig = getStatusConfig(dispute.status);
  const StatusIcon = statusConfig.icon;
  
  const isUserInvolved = userAddress && (dispute.plaintiff === userAddress || dispute.defendant === userAddress);
  const userIsPlaintiff = userAddress && dispute.plaintiff === userAddress;
  
  const getOutcome = () => {
    if (dispute.status !== 2) return null;
    if (dispute.resolution === 1) return userIsPlaintiff ? "You won!" : "Plaintiff won";
    if (dispute.resolution === 2) return !userIsPlaintiff ? "You won!" : "Defendant won";
    return null;
  };
  
  const outcome = getOutcome();
  
  return (
    <Link href={`/dispute/${dispute.id}`}>
      <div className="brand-card p-5 hover:brand-card-hover transition-all cursor-pointer group">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold">Dispute #{dispute.id.slice(-8)}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{dispute.description}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusConfig.text}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <span className="text-muted-foreground text-xs">Plaintiff</span>
            <AddressDisplay address={dispute.plaintiff} maxLength={10} className="text-xs font-mono block" />
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Defendant</span>
            <AddressDisplay address={dispute.defendant} maxLength={10} className="text-xs font-mono block" />
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <div>
            <span className="text-xs text-muted-foreground">Amount</span>
            <p className="font-bold text-accent">{formatAmount(dispute.amount)} GEN</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Created</span>
            <p className="text-sm">{formatDate(dispute.created_at)}</p>
          </div>
        </div>
        
        {outcome && (
          <div className={`mt-3 pt-3 border-t border-white/10 text-sm font-medium ${dispute.resolution === 1 && userIsPlaintiff || dispute.resolution === 2 && !userIsPlaintiff ? 'text-green-400' : 'text-red-400'}`}>
            {outcome}
          </div>
        )}
        
        {isUserInvolved && dispute.status === 2 && Date.now() / 1000 < dispute.appeal_deadline && (
          <div className="mt-3 text-xs text-yellow-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Appeal available
          </div>
        )}
        
        <div className="mt-3 flex justify-end">
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}