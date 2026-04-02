// frontend/app/components/AppealButton.tsx
"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface AppealButtonProps {
  disputeId: string;
  deadline: number;
  onAppeal: () => void;
  isAppealing: boolean;
}

export function AppealButton({ disputeId, deadline, onAppeal, isAppealing }: AppealButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isDeadlinePassed = Date.now() / 1000 > deadline;
  
  if (isDeadlinePassed) {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Appeal period has ended</p>
      </div>
    );
  }
  
  if (showConfirm) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">Appealing will trigger 1,000 validators to re-evaluate the dispute. This action cannot be undone.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowConfirm(false)} className="flex-1 btn-secondary py-2 text-sm">Cancel</button>
          <button onClick={onAppeal} disabled={isAppealing} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition text-sm disabled:opacity-50">
            {isAppealing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm Appeal"}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <button onClick={() => setShowConfirm(true)} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
      ⚖️ Appeal Decision
    </button>
  );
}