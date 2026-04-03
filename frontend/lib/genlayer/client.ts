// frontend/lib/genlayer/client.ts
"use client";

import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { createWalletClient, custom, type WalletClient } from "viem";

// GenLayer Network Configuration for Testnet Bradbury
export const GENLAYER_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "4221");
export const GENLAYER_CHAIN_ID_HEX = `0x${GENLAYER_CHAIN_ID.toString(16).toUpperCase()}`;

console.log("🔧 [client.ts] Network Configuration Loaded:", {
  GENLAYER_CHAIN_ID,
  GENLAYER_CHAIN_ID_HEX,
  envChainId: process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID,
});

export const GENLAYER_NETWORK = {
  chainId: GENLAYER_CHAIN_ID_HEX,
  chainName: process.env.NEXT_PUBLIC_GENLAYER_CHAIN_NAME || "GenLayer Bradbury Testnet",
  nativeCurrency: {
    name: process.env.NEXT_PUBLIC_GENLAYER_SYMBOL || "GEN",
    symbol: process.env.NEXT_PUBLIC_GENLAYER_SYMBOL || "GEN",
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://rpc-bradbury.genlayer.com"],
  blockExplorerUrls: ["https://explorer-bradbury.genlayer.com"],
};

console.log("🌐 [client.ts] GENLAYER_NETWORK:", GENLAYER_NETWORK);

// Ethereum provider type from window
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/**
 * Get the GenLayer RPC URL from environment variables
 * In development, use the Next.js API route proxy to avoid CORS
 */
export function getRpcUrl(): string {
  // Check if we're in the browser and in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔄 [client.ts] Using API route proxy for development');
    return '/api/rpc';
  }
  
  const url = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://rpc-bradbury.genlayer.com";
  console.log('📍 [client.ts] getRpcUrl:', url);
  return url;
}

// Keep for backward compatibility
export function getTestnetUrl(): string {
  const url = getRpcUrl();
  console.log("📍 [client.ts] getTestnetUrl:", url);
  return url;
}

/**
 * Get the contract address from environment variables
 */
export function getContractAddress(): string {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  console.log("📄 [client.ts] getContractAddress:", address || "NOT SET");
  if (!address) {
    return "";
  }
  return address;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  const installed = typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
  console.log("🦊 [client.ts] isMetaMaskInstalled:", installed);
  return installed;
}

/**
 * Get the Ethereum provider (MetaMask)
 */
export function getEthereumProvider(): EthereumProvider | null {
  const provider = typeof window !== "undefined" ? window.ethereum || null : null;
  console.log("🔌 [client.ts] getEthereumProvider:", provider ? "Available" : "Not available");
  return provider;
}

/**
 * Request accounts from MetaMask
 */
export async function requestAccounts(): Promise<string[]> {
  console.log("📞 [client.ts] requestAccounts - Requesting accounts from MetaMask...");
  const provider = getEthereumProvider();

  if (!provider) {
    console.error("❌ [client.ts] requestAccounts - MetaMask is not installed");
    throw new Error("MetaMask is not installed");
  }

  try {
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });
    console.log("✅ [client.ts] requestAccounts - Accounts received:", accounts);
    return accounts;
  } catch (error: any) {
    console.error("❌ [client.ts] requestAccounts - Error:", error);
    if (error.code === 4001) {
      throw new Error("User rejected the connection request");
    }
    throw new Error(`Failed to connect to MetaMask: ${error.message}`);
  }
}

/**
 * Get current MetaMask accounts without requesting permission
 */
export async function getAccounts(): Promise<string[]> {
  console.log("📞 [client.ts] getAccounts - Getting accounts without permission...");
  const provider = getEthereumProvider();

  if (!provider) {
    console.log("⚠️ [client.ts] getAccounts - No provider");
    return [];
  }

  try {
    const accounts = await provider.request({
      method: "eth_accounts",
    });
    console.log("✅ [client.ts] getAccounts - Accounts:", accounts);
    return accounts;
  } catch (error) {
    console.error("❌ [client.ts] getAccounts - Error:", error);
    return [];
  }
}

/**
 * Get the current chain ID from MetaMask
 */
export async function getCurrentChainId(): Promise<string | null> {
  console.log("⛓️ [client.ts] getCurrentChainId - Getting current chain ID...");
  const provider = getEthereumProvider();
  
  if (!provider) {
    console.log("⚠️ [client.ts] getCurrentChainId - No provider");
    return null;
  }

  try {
    const chainId = await provider.request({
      method: "eth_chainId",
    });
    console.log("✅ [client.ts] getCurrentChainId - Chain ID:", chainId, "(decimal:", parseInt(chainId, 16), ")");
    return chainId;
  } catch (error) {
    console.error("❌ [client.ts] getCurrentChainId - Error:", error);
    return null;
  }
}

/**
 * Add GenLayer network to MetaMask
 */
export async function addGenLayerNetwork(): Promise<void> {
  console.log("➕ [client.ts] addGenLayerNetwork - Adding GenLayer network to MetaMask...");
  console.log("   Network config:", GENLAYER_NETWORK);
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [GENLAYER_NETWORK],
    });
    console.log("✅ [client.ts] addGenLayerNetwork - Network added successfully!");
  } catch (error: any) {
    console.error("❌ [client.ts] addGenLayerNetwork - Error:", error);
    if (error.code === 4001) {
      throw new Error("User rejected adding the network");
    }
    throw new Error(`Failed to add GenLayer network: ${error.message}`);
  }
}

/**
 * Switch to GenLayer network
 */
export async function switchToGenLayerNetwork(): Promise<void> {
  console.log("🔄 [client.ts] switchToGenLayerNetwork - Switching to GenLayer network...");
  console.log("   Target chain ID:", GENLAYER_CHAIN_ID_HEX);
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GENLAYER_CHAIN_ID_HEX }],
    });
    console.log("✅ [client.ts] switchToGenLayerNetwork - Switched successfully!");
  } catch (error: any) {
    console.log("⚠️ [client.ts] switchToGenLayerNetwork - Error code:", error.code);
    if (error.code === 4902) {
      console.log("📝 [client.ts] Network not added yet, adding now...");
      await addGenLayerNetwork();
    } else if (error.code === 4001) {
      throw new Error("User rejected switching the network");
    } else {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
}

/**
 * Check if we're on the GenLayer network
 */
export async function isOnGenLayerNetwork(): Promise<boolean> {
  console.log("🔍 [client.ts] isOnGenLayerNetwork - Checking current network...");
  const chainId = await getCurrentChainId();

  if (!chainId) {
    console.log("⚠️ [client.ts] isOnGenLayerNetwork - No chain ID found");
    return false;
  }

  const currentChainIdDecimal = parseInt(chainId, 16);
  const isCorrect = currentChainIdDecimal === GENLAYER_CHAIN_ID;
  
  console.log(`📊 [client.ts] isOnGenLayerNetwork - Current: ${currentChainIdDecimal}, Expected: ${GENLAYER_CHAIN_ID}, Match: ${isCorrect}`);
  
  return isCorrect;
}

/**
 * Connect to MetaMask and ensure we're on GenLayer network
 */
export async function connectMetaMask(): Promise<string> {
  console.log("🚀 [client.ts] connectMetaMask - Starting connection process...");
  
  if (!isMetaMaskInstalled()) {
    console.error("❌ [client.ts] connectMetaMask - MetaMask not installed");
    throw new Error("MetaMask is not installed");
  }

  console.log("📞 [client.ts] connectMetaMask - Requesting accounts...");
  const accounts = await requestAccounts();

  if (!accounts || accounts.length === 0) {
    console.error("❌ [client.ts] connectMetaMask - No accounts found");
    throw new Error("No accounts found");
  }

  console.log("🔍 [client.ts] connectMetaMask - Checking network...");
  const onCorrectNetwork = await isOnGenLayerNetwork();

  if (!onCorrectNetwork) {
    console.log("🔄 [client.ts] connectMetaMask - Not on correct network, switching...");
    await switchToGenLayerNetwork();
    console.log("✅ [client.ts] connectMetaMask - Network switch completed");
  } else {
    console.log("✅ [client.ts] connectMetaMask - Already on correct network");
  }

  console.log("✅ [client.ts] connectMetaMask - Connection successful! Address:", accounts[0]);
  return accounts[0];
}

/**
 * Request user to switch MetaMask account
 */
export async function switchAccount(): Promise<string> {
  console.log("🔄 [client.ts] switchAccount - Requesting account switch...");
  const provider = getEthereumProvider();

  if (!provider) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    console.log("✅ [client.ts] switchAccount - Permissions requested");

    const accounts = await provider.request({
      method: "eth_accounts",
    });
    console.log("✅ [client.ts] switchAccount - New account:", accounts[0]);

    if (!accounts || accounts.length === 0) {
      throw new Error("No account selected");
    }

    return accounts[0];
  } catch (error: any) {
    console.error("❌ [client.ts] switchAccount - Error:", error);
    if (error.code === 4001) {
      throw new Error("User rejected account switch");
    } else if (error.code === -32002) {
      throw new Error("Account switch request already pending");
    }
    throw new Error(`Failed to switch account: ${error.message}`);
  }
}

/**
 * Create a viem wallet client from MetaMask provider
 */
export function createMetaMaskWalletClient(): WalletClient | null {
  console.log("👛 [client.ts] createMetaMaskWalletClient - Creating wallet client...");
  const provider = getEthereumProvider();

  if (!provider) {
    console.log("⚠️ [client.ts] createMetaMaskWalletClient - No provider");
    return null;
  }

  try {
    const client = createWalletClient({
      chain: testnetBradbury as any,
      transport: custom(provider),
    });
    console.log("✅ [client.ts] createMetaMaskWalletClient - Client created");
    return client;
  } catch (error) {
    console.error("❌ [client.ts] createMetaMaskWalletClient - Error:", error);
    return null;
  }
}

/**
 * Create a GenLayer client with MetaMask account
 */
export function createGenLayerClient(address?: string) {
  console.log("🔧 [client.ts] createGenLayerClient - Creating GenLayer client...");
  console.log("   Address:", address || "Not provided");
  console.log("   RPC URL:", getRpcUrl());
  
  const config: any = {
    chain: testnetBradbury,
    endpoint: getRpcUrl(),
  };

  if (address) {
    config.account = address as `0x${string}`;
    console.log("   Account set:", address);
  }

  try {
    const client = createClient(config);
    console.log("✅ [client.ts] createGenLayerClient - Client created successfully");
    return client;
  } catch (error) {
    console.error("❌ [client.ts] createGenLayerClient - Error:", error);
    return createClient({
      chain: testnetBradbury,
      endpoint: getRpcUrl(),
    });
  }
}

/**
 * Get a client instance with MetaMask account
 */
export async function getClient() {
  console.log("🔧 [client.ts] getClient - Getting client with account...");
  const accounts = await getAccounts();
  const address = accounts[0];
  console.log("   Using address:", address);
  return createGenLayerClient(address);
}