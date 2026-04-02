"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Aidvocate from "../contracts/Aidvocate";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { Dispute, ContractConfig } from "../contracts/types";

export function useAidvocateContract(): Aidvocate | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file."
      );
      return null;
    }
    return new Aidvocate(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

export function useDisputes() {
  const contract = useAidvocateContract();

  return useQuery<Dispute[], Error>({
    queryKey: ["disputes"],
    queryFn: () => {
      if (!contract) return Promise.resolve([]);
      return contract.getAllDisputes();
    },
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

export function useUserDisputes(address: string | null) {
  const contract = useAidvocateContract();

  return useQuery<Dispute[], Error>({
    queryKey: ["userDisputes", address],
    queryFn: () => {
      if (!contract) return Promise.resolve([]);
      return contract.getUserDisputes(address);
    },
    refetchOnWindowFocus: true,
    enabled: !!address && !!contract,
    staleTime: 2000,
  });
}

export function useContractConfig() {
  const contract = useAidvocateContract();

  return useQuery<ContractConfig | null, Error>({
    queryKey: ["contractConfig"],
    queryFn: () => {
      if (!contract) return Promise.resolve(null);
      return contract.getContractConfig();
    },
    enabled: !!contract,
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useCreateDispute() {
  const contract = useAidvocateContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      respondent,
      description,
      evidenceCid,
      escrowAmount,
    }: {
      respondent: string;
      description: string;
      evidenceCid: string;
      escrowAmount: string;
    }) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      
      setIsCreating(true);
      return contract.createDispute(respondent, description, evidenceCid, escrowAmount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["userDisputes"] });
      setIsCreating(false);
      success("Dispute created successfully!", {
        description: "Your case has been submitted for AI review."
      });
    },
    onError: (err: any) => {
      console.error("Error creating dispute:", err);
      setIsCreating(false);
      error("Failed to create dispute", {
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

export function useResolveDispute() {
  const contract = useAidvocateContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isResolving, setIsResolving] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (disputeId: string) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      
      setIsResolving(true);
      setResolvingId(disputeId);
      return contract.resolveDispute(disputeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["userDisputes"] });
      setIsResolving(false);
      setResolvingId(null);
      success("Dispute resolved!", {
        description: "AI judges have reached a consensus."
      });
    },
    onError: (err: any) => {
      console.error("Error resolving dispute:", err);
      setIsResolving(false);
      setResolvingId(null);
      error("Failed to resolve dispute", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isResolving,
    resolvingId,
    resolveDispute: mutation.mutate,
    resolveDisputeAsync: mutation.mutateAsync,
  };
}

export function useAppealDispute() {
  const contract = useAidvocateContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isAppealing, setIsAppealing] = useState(false);
  const [appealingId, setAppealingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      disputeId,
      newEvidenceCid,
      appealCost,
    }: {
      disputeId: string;
      newEvidenceCid: string;
      appealCost: string;
    }) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Wallet not connected");
      
      setIsAppealing(true);
      setAppealingId(disputeId);
      return contract.appealDispute(disputeId, newEvidenceCid, appealCost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["userDisputes"] });
      setIsAppealing(false);
      setAppealingId(null);
      success("Appeal submitted!", {
        description: "Full consensus validation triggered."
      });
    },
    onError: (err: any) => {
      console.error("Error appealing dispute:", err);
      setIsAppealing(false);
      setAppealingId(null);
      error("Failed to submit appeal", {
        description: err?.message || "Please try again."
      });
    },
  });

  return {
    ...mutation,
    isAppealing,
    appealingId,
    appealDispute: mutation.mutate,
    appealDisputeAsync: mutation.mutateAsync,
  };
}