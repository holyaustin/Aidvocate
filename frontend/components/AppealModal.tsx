"use client";

import { useState } from "react";
import { Gavel, Loader2, Upload, AlertCircle } from "lucide-react";
import { useAppealDispute, useContractConfig } from "@/lib/hooks/useAidvocate";
import { uploadEvidence } from "@/lib/services/pinata";
import { success, error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import type { Dispute } from "@/lib/contracts/types";

interface AppealModalProps {
  dispute: Dispute;
}

export function AppealModal({ dispute }: AppealModalProps) {
  const { appealDispute, isAppealing } = useAppealDispute();
  const { data: config } = useContractConfig();

  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const appealCost = config ? Number(config.appealCost) / 1e18 : 0.0005;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      error("New evidence required");
      return;
    }

    try {
      setUploading(true);
      const cid = await uploadEvidence(file);
      setUploading(false);

      const appealCostWei = config?.appealCost || "500000000000000";

      appealDispute({
        disputeId: dispute.id,
        newEvidenceCid: cid,
        appealCost: appealCostWei,
      });

      setIsOpen(false);
      setFile(null);
    } catch (err: any) {
      setUploading(false);
      error("Appeal failed", { description: err.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Gavel className="w-3 h-3 mr-1" />
          Appeal
        </Button>
      </DialogTrigger>

      <DialogContent className="brand-card border-2 sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Appeal Decision</DialogTitle>
          <DialogDescription>
            Submit new evidence to trigger full validator consensus review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Alert className="bg-orange-500/10 border-orange-500/20">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-xs">
              Appeal cost: {appealCost} ETH. This triggers expanded validator consensus.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Original Decision</Label>
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              <span className="text-muted-foreground">Winner: </span>
              <span className="capitalize font-semibold">{dispute.resolution}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>New Evidence</Label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="appeal-evidence"
              />
              <label htmlFor="appeal-evidence" className="cursor-pointer">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : "Upload new evidence"}
                </p>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isAppealing || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isAppealing || uploading || !file}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : isAppealing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Pay ${appealCost} ETH & Appeal`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}