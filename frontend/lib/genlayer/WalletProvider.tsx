// frontend/lib/genlayer/WalletProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  isMetaMaskInstalled,
  connectMetaMask,
  switchAccount,
  getAccounts,
  getCurrentChainId,
  isOnGenLayerNetwork,
  getEthereumProvider,
  GENLAYER_CHAIN_ID,
} from "./client";
import { error, userRejected, warning } from "../utils/toast";

const DISCONNECT_FLAG = "wallet_disconnected";

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isMetaMaskInstalled: boolean;
  isOnCorrectNetwork: boolean;
}

interface WalletContextValue extends WalletState {
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  switchWalletAccount: () => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isLoading: true,
    isMetaMaskInstalled: false,
    isOnCorrectNetwork: false,
  });

  useEffect(() => {
    console.log("🏁 [WalletProvider] Initializing wallet...");
    const initWallet = async () => {
      const installed = isMetaMaskInstalled();
      console.log("🦊 [WalletProvider] MetaMask installed:", installed);

      if (!installed) {
        console.log("⚠️ [WalletProvider] MetaMask not installed, setting state");
        setState({
          address: null,
          chainId: null,
          isConnected: false,
          isLoading: false,
          isMetaMaskInstalled: false,
          isOnCorrectNetwork: false,
        });
        return;
      }

      if (typeof window !== "undefined") {
        const wasDisconnected = localStorage.getItem(DISCONNECT_FLAG) === "true";
        console.log("🔐 [WalletProvider] Previously disconnected:", wasDisconnected);
        
        if (wasDisconnected) {
          console.log("⚠️ [WalletProvider] User previously disconnected, not auto-reconnecting");
          setState({
            address: null,
            chainId: null,
            isConnected: false,
            isLoading: false,
            isMetaMaskInstalled: true,
            isOnCorrectNetwork: false,
          });
          return;
        }
      }

      try {
        console.log("📞 [WalletProvider] Getting accounts...");
        const accounts = await getAccounts();
        console.log("📞 [WalletProvider] Accounts:", accounts);
        
        const chainId = await getCurrentChainId();
        console.log("⛓️ [WalletProvider] Current chain ID:", chainId);
        
        const correctNetwork = await isOnGenLayerNetwork();
        console.log("🌐 [WalletProvider] On correct network:", correctNetwork);

        setState({
          address: accounts[0] || null,
          chainId,
          isConnected: accounts.length > 0,
          isLoading: false,
          isMetaMaskInstalled: true,
          isOnCorrectNetwork: correctNetwork,
        });
        
        console.log("✅ [WalletProvider] Initial state set:", {
          address: accounts[0] ? `${accounts[0].slice(0, 10)}...` : null,
          isConnected: accounts.length > 0,
          isOnCorrectNetwork: correctNetwork,
        });
      } catch (error) {
        console.error("❌ [WalletProvider] Error initializing wallet:", error);
        setState({
          address: null,
          chainId: null,
          isConnected: false,
          isLoading: false,
          isMetaMaskInstalled: true,
          isOnCorrectNetwork: false,
        });
      }
    };

    initWallet();
  }, []);

  useEffect(() => {
    const provider = getEthereumProvider();
    console.log("🎧 [WalletProvider] Setting up event listeners, provider:", provider ? "Available" : "Not available");

    if (!provider) {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log("🔄 [WalletProvider] accountsChanged event - New accounts:", accounts);
      const chainId = await getCurrentChainId();
      const correctNetwork = await isOnGenLayerNetwork();

      if (accounts.length > 0 && typeof window !== "undefined") {
        localStorage.removeItem(DISCONNECT_FLAG);
        console.log("🔓 [WalletProvider] Disconnect flag cleared");
      }

      setState((prev) => ({
        ...prev,
        address: accounts[0] || null,
        chainId,
        isConnected: accounts.length > 0,
        isOnCorrectNetwork: correctNetwork,
      }));
      
      console.log("✅ [WalletProvider] State updated after accountsChanged");
    };

    const handleChainChanged = async (chainId: string) => {
      console.log("🔄 [WalletProvider] chainChanged event - New chain ID:", chainId);
      const correctNetwork = parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
      const accounts = await getAccounts();
      console.log(`📊 [WalletProvider] Chain ID comparison: ${parseInt(chainId, 16)} === ${GENLAYER_CHAIN_ID}? ${correctNetwork}`);

      setState((prev) => ({
        ...prev,
        chainId,
        address: accounts[0] || null,
        isConnected: accounts.length > 0,
        isOnCorrectNetwork: correctNetwork,
      }));
      
      console.log("✅ [WalletProvider] State updated after chainChanged");
    };

    const handleDisconnect = () => {
      console.log("🔌 [WalletProvider] disconnect event - Wallet disconnected");
      setState((prev) => ({
        ...prev,
        address: null,
        isConnected: false,
      }));
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);
    
    console.log("✅ [WalletProvider] Event listeners registered");

    return () => {
      console.log("🧹 [WalletProvider] Cleaning up event listeners");
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    console.log("🔌 [WalletProvider] connectWallet - User initiated connection");
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      console.log("⏳ [WalletProvider] Loading state set to true");

      const address = await connectMetaMask();
      console.log("✅ [WalletProvider] Connected to address:", address);
      
      const chainId = await getCurrentChainId();
      console.log("⛓️ [WalletProvider] Current chain ID:", chainId);
      
      const correctNetwork = await isOnGenLayerNetwork();
      console.log("🌐 [WalletProvider] On correct network:", correctNetwork);

      if (typeof window !== "undefined") {
        localStorage.removeItem(DISCONNECT_FLAG);
      }

      setState({
        address,
        chainId,
        isConnected: true,
        isLoading: false,
        isMetaMaskInstalled: true,
        isOnCorrectNetwork: correctNetwork,
      });
      
      console.log("✅ [WalletProvider] State updated after successful connection");
      return address;
    } catch (err: any) {
      console.error("❌ [WalletProvider] connectWallet error:", err);
      setState((prev) => ({ ...prev, isLoading: false }));

      if (err.message?.includes("rejected")) {
        userRejected("Connection cancelled");
      } else if (err.message?.includes("MetaMask is not installed")) {
        error("MetaMask not found", {
          description: "Please install MetaMask to connect your wallet.",
          action: {
            label: "Install MetaMask",
            onClick: () => window.open("https://metamask.io/download/", "_blank")
          }
        });
      } else {
        error("Failed to connect wallet", {
          description: err.message || "Please check your MetaMask and try again."
        });
      }

      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log("🔌 [WalletProvider] disconnectWallet - User initiated disconnection");
    if (typeof window !== "undefined") {
      localStorage.setItem(DISCONNECT_FLAG, "true");
      console.log("🔒 [WalletProvider] Disconnect flag set");
    }

    setState((prev) => ({
      ...prev,
      address: null,
      isConnected: false,
    }));
    
    console.log("✅ [WalletProvider] Wallet disconnected");
  }, []);

  const switchWalletAccount = useCallback(async () => {
    console.log("🔄 [WalletProvider] switchWalletAccount - User requested account switch");
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const newAddress = await switchAccount();
      console.log("✅ [WalletProvider] Switched to new address:", newAddress);

      const chainId = await getCurrentChainId();
      const correctNetwork = await isOnGenLayerNetwork();

      if (typeof window !== "undefined") {
        localStorage.removeItem(DISCONNECT_FLAG);
      }

      setState({
        address: newAddress,
        chainId,
        isConnected: true,
        isLoading: false,
        isMetaMaskInstalled: true,
        isOnCorrectNetwork: correctNetwork,
      });
      
      console.log("✅ [WalletProvider] State updated after account switch");
      return newAddress;
    } catch (err: any) {
      console.error("❌ [WalletProvider] switchWalletAccount error:", err);
      setState((prev) => ({ ...prev, isLoading: false }));

      if (err.message?.includes("rejected")) {
        userRejected("Account switch cancelled");
      } else {
        error("Failed to switch account", {
          description: err.message || "Please try again."
        });
      }

      throw err;
    }
  }, []);

  const value: WalletContextValue = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchWalletAccount,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}