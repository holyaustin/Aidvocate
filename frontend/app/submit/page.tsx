// frontend/app/submit/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/genlayer/wallet";
import { useCreateDispute } from "@/lib/hooks/useAidvocate";
import { uploadToIPFS } from "@/lib/utils/pinata";
import { toast } from "sonner";
import { Upload, Loader2, AlertCircle } from "lucide-react";

export default function SubmitPage() {
  const router = useRouter();
  const { address, isConnected, connectWallet, isLoading: walletLoading } = useWallet();
  const { mutateAsync: createDispute, isPending: isCreating } = useCreateDispute();
  
  const [defendant, setDefendant] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [evidenceCID, setEvidenceCID] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!defendant.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.defendant = "Invalid Ethereum address format";
    }
    if (!description.trim()) newErrors.description = "Description is required";
    if (description.length > 2000) newErrors.description = "Description must be less than 2000 characters";
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!evidenceCID) newErrors.evidence = "Please upload evidence";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setIsUploading(true);
    try {
      const cid = await uploadToIPFS(selectedFile);
      setEvidenceCID(cid);
      toast.success("Evidence uploaded to IPFS!");
    } catch (error) {
      toast.error("Failed to upload evidence");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      await connectWallet();
      return;
    }
    
    if (!validateForm()) return;
    
    const amountWei = (parseFloat(amount) * 1e18).toString();
    
    try {
      const result = await createDispute({
        defendant,
        description,
        evidenceCID,
        amountWei,
      });
      toast.success(`Dispute created! ID: ${result.disputeId}`);
      router.push(`/dispute/${result.disputeId}`);
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    }
  };

  if (walletLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create a New Dispute</h1>
        <p className="text-muted-foreground mb-6">
          Submit your dispute details. The amount will be escrowed until AI validators reach consensus.
        </p>
        
        <form onSubmit={handleSubmit} className="brand-card p-6 space-y-6">
          {/* Defendant Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Defendant Address</label>
            <input
              type="text"
              value={defendant}
              onChange={(e) => setDefendant(e.target.value)}
              placeholder="0x..."
              className={`w-full p-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.defendant ? "border-red-500" : "border-border"
              }`}
            />
            {errors.defendant && <p className="text-xs text-red-500 mt-1">{errors.defendant}</p>}
          </div>
          
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount (GEN)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className={`w-full p-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.amount ? "border-red-500" : "border-border"
              }`}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the dispute in detail..."
              rows={5}
              className={`w-full p-3 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.description ? "border-red-500" : "border-border"
              }`}
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/2000 characters</p>
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
          
          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Evidence</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer block">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                ) : evidenceCID ? (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-green-400 mb-2" />
                    <p className="text-sm text-green-400">✓ Uploaded: {evidenceCID.slice(0, 20)}...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click or drag to upload evidence</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, images, text files accepted</p>
                  </>
                )}
              </label>
            </div>
            {errors.evidence && <p className="text-xs text-red-500 mt-1">{errors.evidence}</p>}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating || isUploading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating Dispute...
              </>
            ) : (
              "Submit Dispute"
            )}
          </button>
        </form>
        
        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-400">How It Works</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your dispute will be reviewed by 5 AI validators. The winner receives the escrowed funds.
                You can appeal within 7 days to trigger 1,000 validators for a final decision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}