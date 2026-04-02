// frontend/app/components/SubmitEvidenceModal.tsx
"use client";

import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { useSubmitEvidence } from "@/lib/hooks/useAidvocate";
import { uploadToIPFS } from "@/lib/utils/pinata";
import { toast } from "sonner";

interface SubmitEvidenceModalProps {
  disputeId: string;
}

export function SubmitEvidenceModal({ disputeId }: SubmitEvidenceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cid, setCid] = useState("");
  const [evidenceType, setEvidenceType] = useState("document");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: submitEvidence, isPending: isSubmitting } = useSubmitEvidence();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const uploadedCid = await uploadToIPFS(file);
      setCid(uploadedCid);
      toast.success("Evidence uploaded to IPFS!");
    } catch (error) {
      toast.error("Failed to upload evidence");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!cid || !evidenceType || !description) {
      toast.error("Please fill in all fields");
      return;
    }
    
    submitEvidence({ disputeId, cid, evidenceType, description });
    setCid("");
    setEvidenceType("document");
    setDescription("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary text-sm">
        <Upload className="w-4 h-4 mr-2" />
        Submit Evidence
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="brand-card w-full max-w-md p-6 relative">
        <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold mb-4">Submit Evidence</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Evidence File</label>
            <input type="file" onChange={handleFileUpload} className="w-full text-sm" disabled={isUploading} />
            {cid && <p className="text-xs text-green-400 mt-1">✓ Uploaded: {cid.slice(0, 20)}...</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Evidence Type</label>
            <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)} className="w-full p-2 rounded-lg border bg-transparent">
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this evidence..." rows={3} className="w-full p-2 rounded-lg border bg-transparent" />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsOpen(false)} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={!cid || isSubmitting || isUploading} className="flex-1 btn-primary disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}