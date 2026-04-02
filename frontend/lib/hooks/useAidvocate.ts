// frontend/lib/hooks/useAidvocate.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Aidvocate } from "../contracts/Aidvocate";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { toast } from "sonner";
import type { Dispute, Evidence, ContractStats, LeaderboardEntry } from "../contracts/types";

/**
 * Hook to get the Aidvocate contract instance
 */
export function useAidvocateContract(): Aidvocate | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const rpcUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      console.warn("Contract address not configured");
      return null;
    }
    return new Aidvocate(contractAddress, address, rpcUrl);
  }, [contractAddress, address, rpcUrl]);

  return contract;
}

/**
 * Hook to fetch a specific dispute
 */
export function useDispute(disputeId: string | null) {
  const contract = useAidvocateContract();

  return useQuery<Dispute | null, Error>({
    queryKey: ["dispute", disputeId],
    queryFn: () => {
      if (!contract || !disputeId) return Promise.resolve(null);
      return contract.getDispute(disputeId);
    },
    enabled: !!contract && !!disputeId,
    staleTime: 2000,
  });
}

/**
 * Hook to fetch evidence for a dispute
 */
export function useEvidence(disputeId: string | null) {
  const contract = useAidvocateContract();

  return useQuery<Evidence[], Error>({
    queryKey: ["evidence", disputeId],
    queryFn: () => {
      if (!contract || !disputeId) return Promise.resolve([]);
      return contract.getEvidence(disputeId);
    },
    enabled: !!contract && !!disputeId,
    staleTime: 2000,
  });
}

/**
 * Hook to fetch disputes by party
 */
export function useDisputesByParty(address: string | null) {
  const contract = useAidvocateContract();

  return useQuery<Dispute[], Error>({
    queryKey: ["disputes", address],
    queryFn: () => {
      if (!contract || !address) return Promise.resolve([]);
      return contract.getDisputesByParty(address);
    },
    enabled: !!contract && !!address,
    staleTime: 2000,
  });
}

/**
 * Hook to fetch player points
 */
export function usePlayerPoints(address: string | null) {
  const contract = useAidvocateContract();

  return useQuery<number, Error>({
    queryKey: ["playerPoints", address],
    queryFn: () => {
      if (!contract || !address) return Promise.resolve(0);
      return contract.getPlayerPoints(address);
    },
    enabled: !!contract && !!address,
    staleTime: 2000,
  });
}

/**
 * Hook to fetch leaderboard
 */
export function useLeaderboard() {
  const contract = useAidvocateContract();

  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard"],
    queryFn: () => {
      if (!contract) return Promise.resolve([]);
      return contract.getLeaderboard();
    },
    enabled: !!contract,
    staleTime: 2000,
  });
}

/**
 * Hook to fetch contract statistics
 */
export function useStats() {
  const contract = useAidvocateContract();

  return useQuery<ContractStats | null, Error>({
    queryKey: ["stats"],
    queryFn: () => {
      if (!contract) return Promise.resolve(null);
      return contract.getStats();
    },
    enabled: !!contract,
    staleTime: 5000,
  });
}

/**
 * Hook to create a new dispute
 */
export function useCreateDispute() {
  const contract = useAidvocateContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      defendant,
      description,
      evidenceCID,
      amountWei,
    }: {
      defendant: string;
      description: string;
      evidenceCID: string;
      amountWei: string;
    }) => {
      if (!contract) {
        throw new Error("Contract not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file.");
      }
      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet to create a dispute.");
      }
      setIsCreating(true);
      return contract.createDispute(defendant, description, evidenceCID, amountWei);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["playerPoints"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setIsCreating(false);
      toast.success("Dispute created successfully!", {
        description: `Dispute #${result.disputeId.slice(-8)} has been submitted for AI review.`
      });
    },
    onError: (err: any) => {
      console.error("Error creating dispute:", err);
      setIsCreating(false);
      toast.error("Failed to create dispute", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isCreating,
    createDispute: mutation.mutate,
    createDisputeAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to submit evidence
 */
export function useSubmitEvidence() {
  const contract = useAidvocateContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      disputeId,
      cid,
      evidenceType,
      description,
    }: {
      disputeId: string;
      cid: string;
      evidenceType: string;
      description: string;
    }) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }
      setIsSubmitting(true);
      return contract.submitEvidence(disputeId, cid, evidenceType, description);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evidence", variables.disputeId] });
      queryClient.invalidateQueries({ queryKey: ["dispute", variables.disputeId] });
      setIsSubmitting(false);
      toast.success("Evidence submitted successfully!", {
        description: "The dispute will be re-evaluated with new evidence."
      });
    },
    onError: (err: any) => {
      console.error("Error submitting evidence:", err);
      setIsSubmitting(false);
      toast.error("Failed to submit evidence", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isSubmitting,
    submitEvidence: mutation.mutate,
  };
}

/**
 * Hook to appeal a dispute
 */
export function useAppeal() {
  const contract = useAidvocateContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isAppealing, setIsAppealing] = useState(false);

  const mutation = useMutation({
    mutationFn: async (disputeId: string) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }
      setIsAppealing(true);
      return contract.appeal(disputeId);
    },
    onSuccess: (_, disputeId) => {
      queryClient.invalidateQueries({ queryKey: ["dispute", disputeId] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setIsAppealing(false);
      toast.success("Appeal submitted successfully!", {
        description: "1,000 validators will now review the dispute."
      });
    },
    onError: (err: any) => {
      console.error("Error appealing dispute:", err);
      setIsAppealing(false);
      toast.error("Failed to appeal", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isAppealing,
    appeal: mutation.mutate,
  };
}