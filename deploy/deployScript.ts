import { readFileSync } from "fs";
import path from "path";
import {
  TransactionHash,
  TransactionStatus,
  GenLayerClient,
  DecodedDeployData,
  GenLayerChain,
} from "genlayer-js/types";
import { studionet, testnetBradbury, localnet } from "genlayer-js/chains";

function getNetworkType(client: GenLayerClient<any>): string {
  const chainId = (client.chain as GenLayerChain)?.id;
  if (chainId === studionet.id) return "studionet";
  if (chainId === testnetBradbury.id) return "testnetBradbury";
  if (chainId === localnet.id) return "localnet";
  return "unknown";
}

export default async function main(client: GenLayerClient<any>) {
  const filePath = path.resolve(process.cwd(), "contracts/aidvocate.py");

  try {
    const networkType = getNetworkType(client);
    console.log("🚀 Starting Aidvocate deployment...");
    console.log(`📡 Network: ${networkType}`);
    
    // Read contract file
    const contractCode = new Uint8Array(readFileSync(filePath));
    console.log(`📄 Contract file loaded: ${contractCode.length} bytes`);

    // Deprecated – we can omit, but leaving it harmless
    // await client.initializeConsensusSmartContract();

    // Deploy the contract with a high gas limit
    console.log("📤 Deploying contract with gas limit 10,000,000...");
    const deployTransaction = await client.deployContract({
      code: contractCode,
      args: [], // No constructor arguments
      //gas: 10_000_000,          // Explicit gas limit (increase if needed)
      // gasPrice: ...          // Optional: set gas price if required
    });

    console.log(`⏳ Waiting for deployment confirmation...`);
    console.log(`   Transaction hash: ${deployTransaction}`);

    // Wait with longer retries (20 minutes total)
    const receipt = await client.waitForTransactionReceipt({
      hash: deployTransaction as TransactionHash,
      status: TransactionStatus.ACCEPTED,
      retries: 120,           // 120 * 10s = 20 minutes
      interval: 10000,        // 10 seconds between retries
    });

    console.log(`📋 Receipt received:`, {
      status: receipt.status,
      statusName: receipt.statusName,
    });

    // Verify success
    if (
      receipt.status !== 5 && // ACCEPTED
      receipt.status !== 6 && // FINALIZED
      receipt.statusName !== "ACCEPTED" &&
      receipt.statusName !== "FINALIZED"
    ) {
      throw new Error(`Deployment failed. Receipt: ${JSON.stringify(receipt, null, 2)}`);
    }

    // Extract contract address based on network
    let deployedContractAddress: string | undefined;
    
    if (networkType === "studionet" || networkType === "localnet") {
      deployedContractAddress = (receipt.data as any)?.contract_address;
    } else if (networkType === "testnetBradbury") {
      const decodedData = receipt.txDataDecoded as DecodedDeployData;
      deployedContractAddress = decodedData?.contractAddress;
    }

    if (!deployedContractAddress) {
      console.error("Receipt structure:", JSON.stringify(receipt, (k, v) => 
        typeof v === 'bigint' ? v.toString() : v, 2));
      throw new Error("Failed to extract contract address from receipt");
    }

    console.log("\n✅ =========================================");
    console.log("✅ Aidvocate deployed successfully!");
    console.log("✅ =========================================");
    console.log(`📍 Contract Address: ${deployedContractAddress}`);
    console.log(`🔗 Transaction Hash: ${deployTransaction}`);
    console.log(`📦 Network: ${networkType}`);
    console.log("\n📝 Add this to your frontend/.env.local:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedContractAddress}`);
    console.log("=========================================\n");

    return deployedContractAddress;
    
  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error("Error details:", error);
    throw error;
  }
}