// frontend/lib/utils/pinata.ts
import axios from 'axios';

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadToIPFS(file: File): Promise<string> {
  if (!JWT) {
    throw new Error('Pinata JWT not configured. Please set NEXT_PUBLIC_PINATA_JWT in .env');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Authorization': `Bearer ${JWT}`,
        'Content-Type': 'multipart/form-data',
      },
      maxBodyLength: Infinity,
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

/**
 * Upload JSON data to IPFS
 */
export async function uploadJSONToIPFS(data: object): Promise<string> {
  if (!JWT) {
    throw new Error('Pinata JWT not configured');
  }

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          'Authorization': `Bearer ${JWT}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Pinata JSON upload error:', error);
    throw new Error('Failed to upload JSON to IPFS');
  }
}

/**
 * Get content from IPFS by CID
 */
export async function getFromIPFS(cid: string): Promise<any> {
  try {
    const response = await axios.get(`https://${GATEWAY}/ipfs/${cid}`);
    return response.data;
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw new Error('Failed to fetch from IPFS');
  }
}

/**
 * Get a public gateway URL for a CID
 */
export function getIPFSUrl(cid: string): string {
  return `https://${GATEWAY}/ipfs/${cid}`;
}