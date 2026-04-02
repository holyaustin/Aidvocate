"use client";

import { useState } from "react";
import { Plus, Loader2, Upload, AlertCircle } from "lucide-react";
import { useCreateDispute, useContractConfig } from "@/lib/hooks/useAidvocate";
import { useWallet } from "@/lib/genlayer/wallet";
import { uploadEvidence } from "@/lib/services/pinata";
import { success, error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";

export function CreateDisputeModal() {
  const { isConnected, address } = useWallet();
  const { createDispute, isCreating } = useCreateDispute();
  const { data: config } = useContractConfig();

  const [isOpen, setIsOpen] = useState(false);
  const [respondent, setRespondent] = useState("");
  const [description, setDescription] = useState("");
  const [escrowAmount, setEscrowAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const minEscrow = config ? Number(config.minEscrow) / 1e18 : 0.001;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!respondent.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.respondent = "Invalid Ethereum address";
    }
    if (description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    if (!file) {
      newErrors.file = "Evidence file is required";
    }
    const escrow = parseFloat(escrowAmount);
    if (isNaN(escrow) || escrow < minEscrow) {
      newErrors.escrow = `Minimum escrow is ${minEscrow} ETH`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !file) return;

    try {
      setUploading(true);
      const cid = await uploadEvidence(file);
      setUploading(false);
      
      const escrowWei = BigInt(Math.floor(parseFloat(escrowAmount) * 1e18)).toString();
      
      createDispute({
        respondent,
        description,
        evidenceCid: cid,
        escrowAmount: escrowWei,
      });
      
      setIsOpen(false);
      resetForm();
    } catch (err: any) {
      setUploading(false);
      error("Upload failed", { description: err.message });
    }
  };

  const resetForm = () => {
    setRespondent("");
    setDescription("");
    setEscrowAmount("");
    setFile(null);
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" disabled={!isConnected}>
          <Plus className="w-4 h-4 mr-2" />
          New Dispute
        </Button>
      </DialogTrigger>
      
      <DialogContent className="brand-card border-2 sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Dispute</DialogTitle>
          <DialogDescription>
            Submit your case for AI-powered resolution. Escrow funds will be held until resolved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <Alert className="bg-accent/10 border-accent/20">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-xs">
              Minimum escrow: {minEscrow} ETH. A 5% validator fee applies.
            </AlertDescription>
          </Alert>

          {/* Respondent Address */}
          <div className="space-y-2">
            <Label htmlFor="respondent">Respondent Address</Label>
            <Input
              id="respondent"
              placeholder="0x..."
              value={respondent}
              onChange={(e) => setRespondent(e.target.value)}
              className={errors.respondent ? "border-destructive" : ""}
            />
            {errors.respondent && <p className="text-xs text-destructive">{errors.respondent}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Case Description</Label>
            <textarea
              id="description"
              placeholder="Describe the dispute in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>Evidence (PDF, Images, etc.)</Label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="evidence"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
              />
              <label htmlFor="evidence" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : "Click to upload evidence to IPFS"}
                </p>
              </label>
            </div>
            {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
          </div>

          {/* Escrow Amount */}
          <div className="space-y-2">
            <Label htmlFor="escrow">Escrow Amount (ETH)</Label>
            <Input
              id="escrow"
              type="number"
              step="0.001"
              placeholder={`Min ${minEscrow}`}
              value={escrowAmount}
              onChange={(e) => setEscrowAmount(e.target.value)}
              className={errors.escrow ? "border-destructive" : ""}
            />
            {errors.escrow && <p className="text-xs text-destructive">{errors.escrow}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isCreating || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={isCreating || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Submit Dispute"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}