// frontend/app/debug/page.tsx
'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/genlayer/wallet';
import { Aidvocate } from '@/lib/contracts/Aidvocate';

export default function DebugPage() {
  const { address, isConnected } = useWallet();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testCreateDispute = async () => {
    if (!isConnected || !address) {
      setResult('❌ Please connect wallet first');
      return;
    }

    setLoading(true);
    setResult('Testing...');

    try {
      const contract = new Aidvocate(
        '0xf7FFa7F96a0D1c2ca5895B5eD8743A4ccd4f1Ee0',
        address
      );

      // Test with minimal parameters
      const testDefendant = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const testDescription = 'Test dispute for debugging purposes - please resolve';
      const testEvidence = 'QmTest1234567890';
      const testAmount = '10000000000000000000'; // 10 GEN in wei

      const result = await contract.createDispute(
        testDefendant,
        testDescription,
        testEvidence,
        testAmount
      );

      setResult(`✅ Success!\nDispute ID: ${result.disputeId}\nTx Hash: ${result.txHash}`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetStats = async () => {
    setLoading(true);
    try {
      const contract = new Aidvocate('0xf7FFa7F96a0D1c2ca5895B5eD8743A4ccd4f1Ee0');
      const stats = await contract.getStats();
      setResult(`✅ Stats: ${JSON.stringify(stats, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded">
          <p>Wallet: {isConnected ? address : 'Not connected'}</p>
          <p>Contract: 0xf7FFa7F96a0D1c2ca5895B5eD8743A4ccd4f1Ee0</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={testGetStats} 
            disabled={loading}
            className="btn-primary"
          >
            Test Get Stats
          </button>
          
          <button 
            onClick={testCreateDispute} 
            disabled={loading || !isConnected}
            className="btn-primary"
          >
            Test Create Dispute (10 GEN)
          </button>
        </div>

        {result && (
          <pre className="p-4 bg-gray-900 rounded overflow-auto whitespace-pre-wrap">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}