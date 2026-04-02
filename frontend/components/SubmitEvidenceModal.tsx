"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useSubmitEvidence } from "@/lib/hooks/useAidvocate";
import { useWallet } from "@/lib/genlayer/wallet";
import { uploadToIPFS } from "@/lib/pinata";
import { success, error } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface SubmitEvidenceModalProps {
  disputeId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SubmitEvidenceModal({ disputeId, isOpen: externalOpen, onOpenChange: externalOnOpenChange }: SubmitEvidenceModalProps) {
  const { isConnected, address } = useWallet();
  const { submitEvidence, isSubmitting } = useSubmitEvidence();
  
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const onOpenChange = externalOnOpenChange || setInternalOpen;
  
  const [cid, setCid] = useState("");
  const [evidenceType, setEvidenceType] = useState("document");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedCid = await uploadToIPFS(file);
      setCid(uploadedCid);
      success("Evidence uploaded to IPFS!");
    } catch (err) {
      console.error("Upload failed:", err);
      error("Failed to upload evidence");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      error("Please connect your wallet first");
      return;
    }

    if (!cid || !evidenceType || !description) {
      error("Please fill in all fields");
      return;
    }

    try {
      await submitEvidence({ disputeId, cid, evidenceType, description });
      setCid("");
      setEvidenceType("document");
      setDescription("");
      onOpenChange(false);
    } catch (err: any) {
      error(`Failed to submit evidence: ${err.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Submit Evidence
        </Button>
      </DialogTrigger>
      <DialogContent className="brand-card border-2 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Submit Additional Evidence</DialogTitle>
          <DialogDescription>
            Upload evidence to support your case. The dispute will be re-evaluated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="evidenceFile">Evidence File</Label>
            <Input
              id="evidenceFile"
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {cid && (
              <p className="text-xs text-green-400">
                ✓ Uploaded: {cid.slice(0, 20)}...
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidenceType">Evidence Type</Label>
            <select
              id="evidenceType"
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="w-full p-2 rounded-lg border bg-transparent"
            >
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this evidence..."
              rows={3}
              className="w-full p-2 rounded-lg border bg-transparent"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!cid || isSubmitting || isUploading}
            variant="gradient"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Evidence"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}