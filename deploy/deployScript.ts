import { readFileSync } from "fs";
import path from "path";

export default async function main(client: any) {
  const filePath = path.resolve(process.cwd(), "contracts/aidvocate.py");

  try {
    console.log("🚀 Starting Aidvocate deployment...");
    console.log("📡 Network: testnetBradbury");
    
    // Read contract file
    const contractCode = new Uint8Array(readFileSync(filePath));
    console.log(`📄 Contract file loaded: ${contractCode.length} bytes`);

    // Deploy the contract
    console.log("📤 Deploying contract to Bradbury testnet...");
    
    const deployTransaction = await client.deployContract({
      code: contractCode,
      args: [],
    });

    console.log(`✅ Transaction sent!`);
    console.log(`   Transaction hash: ${deployTransaction}`);
    console.log(`⏳ Waiting for confirmation (this may take 1-2 minutes)...`);

    // Wait for confirmation
    const receipt = await client.waitForTransactionReceipt({
      hash: deployTransaction,
      retries: 120,
      interval: 5000,
    });

    console.log(`✅ Deployment confirmed!`);
    console.log(`   Status: ${receipt.status}`);

    // Get contract address - try different possible locations
    let contractAddress = null;
    
    if (receipt.contractAddress) {
      contractAddress = receipt.contractAddress;
    } else if (receipt.txDataDecoded && receipt.txDataDecoded.contractAddress) {
      contractAddress = receipt.txDataDecoded.contractAddress;
    } else if (receipt.data && receipt.data.contract_address) {
      contractAddress = receipt.data.contract_address;
    }

    if (!contractAddress) {
      console.log("\n⚠️  Could not auto-extract contract address.");
      console.log("   Please check the explorer for your deployed contract:");
      console.log(`   https://explorer-bradbury.genlayer.com/tx/${deployTransaction}`);
      console.log("\n   Once you have the address, add it to your .env.local:");
      console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`);
      return null;
    }

    console.log("\n✅ =========================================");
    console.log("✅ Aidvocate deployed successfully!");
    console.log("✅ =========================================");
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🔗 Transaction Hash: ${deployTransaction}`);
    console.log(`🌐 Explorer: https://explorer-bradbury.genlayer.com/address/${contractAddress}`);
    console.log("\n📝 Add this to your frontend/.env.local:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("=========================================\n");

    return contractAddress;
    
  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error instanceof Error ? error.message : error);
    throw error;
  }
}