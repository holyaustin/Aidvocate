# ⚖️ Aidvocate - AI-Powered Dispute Resolution

A decentralized arbitration platform built on GenLayer where AI validators use Optimistic Democracy to resolve disputes fairly and efficiently.

## Features

- 🤖 **AI-Powered Justice**: Validators use advanced LLMs to analyze evidence
- ⚖️ **Optimistic Democracy**: Starts with 5 validators, expands to 1000 on appeal
- 💰 **Earn Forever**: Receive up to 20% of all transaction fees from your contract
- 🔗 **IPFS Storage**: Evidence stored permanently on decentralized storage
- 🎨 **Modern UI**: Built with Next.js 15 and Tailwind CSS

## How It Works

1. **Submit Dispute**: Party deposits disputed amount and submits evidence
2. **AI Review**: 5 validators review evidence and reach consensus
3. **Resolution**: Winner receives escrowed funds, loser gets nothing
4. **Appeal**: Any party can appeal within 7 days, triggering 1000 validators

## Prerequisites

- Node.js 18+
- Python 3.9+
- GenLayer CLI (`npm install -g genlayer`)
- Pinata account (for IPFS storage)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/aidvocate.git
cd aidvocate

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Set up environment
cp .env.example .env
# Add your private key and Pinata JWT

# Deploy contract
genlayer network testnet-bradbury
npm run deploy

# Run frontend
npm run dev