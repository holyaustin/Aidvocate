/**
 * Pinata IPFS service for uploading dispute evidence
 * Based on Pinata SDK documentation: https://docs.pinata.cloud/quickstart
 */

import { PinataSDK } from "pinata";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud";

let pinataClient: PinataSDK | null = null;

/**
 * Get or initialize the Pinata SDK client
 */
export function getPinataClient(): PinataSDK {
  if (!pinataClient) {
    if (!PINATA_JWT) {
      throw new Error("Pinata JWT not configured. Please set NEXT_PUBLIC_PINATA_JWT in your .env file.");
    }
    
    pinataClient = new PinataSDK({
      pinataJwt: PINATA_JWT,
      pinataGateway: PINATA_GATEWAY,
    });
  }
  return pinataClient;
}

/**
 * Upload a file to IPFS via Pinata
 * @param file - The file to upload (File object from browser)
 * @returns The CID (Content Identifier) of the uploaded file
 */
export async function uploadEvidence(file: File): Promise<string> {
  try {
    const client = getPinataClient();
    
    // Use the correct method: upload.public.file()
    const upload = await client.upload.public.file(file);
    
    // Return the CID from the upload response
    return upload.cid;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw new Error(`Failed to upload evidence: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param data - The JSON object to upload
 * @returns The CID (Content Identifier) of the uploaded file
 */
export async function uploadJSON(data: object): Promise<string> {
  try {
    const client = getPinataClient();
    
    // Convert JSON to a File object
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], "evidence.json", { type: "application/json" });
    
    // Upload using the public file method
    const upload = await client.upload.public.file(file);
    
    return upload.cid;
  } catch (error) {
    console.error("Error uploading JSON to Pinata:", error);
    throw new Error(`Failed to upload JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the public gateway URL for a CID
 * @param cid - The Content Identifier
 * @returns The full URL to access the file
 */
export function getEvidenceUrl(cid: string): string {
  if (!cid) {
    throw new Error("CID is required");
  }
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}

/**
 * Fetch content from IPFS by CID
 * @param cid - The Content Identifier
 * @returns The file content as text
 */
export async function getFromIPFS(cid: string): Promise<string> {
  try {
    const client = getPinataClient();
    const data = await client.gateways.public.get(cid);
    
    // Convert the response to text
    if (data && typeof data === 'object' && 'text' in data) {
      return await (data as any).text();
    }
    
    return String(data);
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    throw new Error(`Failed to fetch from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch and parse JSON from IPFS
 * @param cid - The Content Identifier
 * @returns The parsed JSON object
 */
export async function getJSONFromIPFS<T = any>(cid: string): Promise<T> {
  try {
    const text = await getFromIPFS(cid);
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Error parsing JSON from IPFS:", error);
    throw new Error(`Failed to parse JSON from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}