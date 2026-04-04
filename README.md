```markdown
# ⚖️ Aidvocate - AI-Powered Decentralized Dispute Resolution

[![GenLayer](https://img.shields.io/badge/Built%20on-GenLayer-8A2BE2)](https://genlayer.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

**Aidvocate** is a decentralized dispute resolution platform built on **GenLayer**, the first testnet where AI directly participates in blockchain consensus. It leverages AI validators to resolve disputes fairly, transparently, and efficiently.

## 🚀 Live Demo

[View Demo Video](https://youtu.be/your-demo-link) | [Hackathon Submission](https://dorahacks.io)

## ✨ Key Features

- **🤖 AI-Powered Consensus** - Disputes are reviewed by 5 AI validators using Optimistic Democracy consensus
- **📎 On-Chain Evidence** - Evidence stored on IPFS with cryptographic verification
- **🔄 Appeal Mechanism** - Disagree with resolution? Appeal to trigger 1,000 validators for final decision
- **💰 Escrow System** - Disputed amount held in escrow until resolution
- **🏆 Gamification** - Earn points for participation on leaderboard
- **📊 Real-time Stats** - Track total disputes, resolutions, and appeals
- **🎨 Modern UI** - Built with Next.js 15 and Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Submit  │  │ Dispute │  │ Evidence│  │Leader-  │        │
│  │ Dispute │  │ Details │  │ Upload  │  │ board   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              GenLayer Blockchain (Bradbury Testnet)          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Intelligent Contract (Python)              │   │
│  │  • create_dispute()  • submit_evidence()            │   │
│  │  • appeal()          • get_dispute()                │   │
│  │  • get_stats()       • get_points()                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AI Validator Consensus                  │   │
│  │  • 5 validators (initial)  • 1000 validators (appeal)│   │
│  │  • Equivalence Principle    • Optimistic Democracy   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      IPFS (Pinata)                          │
│                    Evidence Storage                          │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Web3**: Wagmi, Viem
- **IPFS**: Pinata SDK

### Blockchain
- **Platform**: GenLayer Bradbury Testnet
- **Contract Language**: Python (GenVM)
- **Consensus**: Optimistic Democracy with AI validators

## Deployed Intelligent contract 
Result:
{
  'Transaction Hash': '0x0298ee329627166f4aeee004fe4f066136deab77c259b9ea26364f2d75e89ea6',
  'Contract Address': '0x71d82f5d73d08e1aFE25b5bfC4b10F75a3efeBb3'
}

✔ Contract deployed successfully.

## 📋 Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn
- GenLayer CLI
- MetaMask or compatible Web3 wallet
- GenLayer testnet tokens (for deployment)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/aidvocate.git
cd aidvocate
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the `frontend` directory:

```env
# Contract Address (after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# IPFS Configuration (Pinata)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key

# RPC Configuration
NEXT_PUBLIC_RPC_URL=https://rpc-bradbury.genlayer.com
```

### 4. Deploy the Intelligent Contract

```bash
# Install GenLayer CLI
npm install -g genlayer

# Deploy to Bradbury testnet
genlayer deploy --contract contracts/aidvocate.py --rpc https://rpc-bradbury.genlayer.com
```

Copy the deployed contract address to your `.env.local` file.

### 5. Run the Development Server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
aidvocate/
├── contracts/
│   └── aidvocate.py           # GenLayer Intelligent Contract
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Dashboard
│   │   ├── submit/            # Create dispute
│   │   ├── dispute/[id]/      # Dispute details
│   │   └── components/        # Reusable components
│   ├── lib/
│   │   ├── contracts/         # Contract interaction
│   │   ├── hooks/             # React Query hooks
│   │   ├── genlayer/          # GenLayer client
│   │   └── utils/             # Utilities (IPFS, etc.)
│   └── public/                # Static assets
├── deploy/
│   └── deployScript.ts        # Deployment script
└── package.json
```

## 🎯 Usage Guide

### Creating a Dispute

1. Connect your Web3 wallet
2. Click "+ New Dispute"
3. Fill in defendant address and description
4. Upload evidence (PDF, image, text)
5. Deposit the disputed amount in GEN
6. Submit - 5 AI validators will review

### Submitting Evidence

1. Navigate to your dispute
2. Click "Submit Evidence"
3. Upload additional evidence
4. Validators re-evaluate with new information

### Appealing a Resolution

1. After resolution, click "Appeal" (within 7 days)
2. 1,000 validators review the case
3. Final decision is binding

## 🔧 Smart Contract Functions

| Function | Description | Access |
|----------|-------------|--------|
| `create_dispute()` | Create new dispute with escrow | Public |
| `submit_evidence()` | Add evidence to dispute | Parties only |
| `appeal()` | Appeal resolved dispute | Parties only |
| `get_dispute()` | View dispute details | Public |
| `get_evidence()` | View all evidence | Public |
| `get_stats()` | Contract statistics | Public |
| `get_points()` | Leaderboard data | Public |

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm run test

# Test contract locally
genlayer test contracts/aidvocate.py
```

## 📊 GenLayer Integration

Aidvocate leverages GenLayer's unique features:

- **Optimistic Democracy**: Starts with 5 validators, scales to 1000 on appeal
- **Equivalence Principle**: AI decisions must be equivalent to human judgment
- **Build Once, Earn Forever**: 20% of transaction fees go to developer
- **AI Validators**: Multiple LLMs ensure unbiased consensus

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GenLayer](https://genlayer.com) - AI-powered blockchain platform
- [Pinata](https://pinata.cloud) - IPFS infrastructure
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling

## 📧 Contact

- **GitHub**: [@yourusername](https://github.com/holyaustin)
- **Twitter**: [@yourhandle](https://twitter.com/holyaustin)

## ⚠️ Disclaimer

This project was built for the GenLayer Hackathon and is running on the Bradbury testnet. Smart contracts are experimental and should not be used with real funds.

---

<div align="center">
  <sub>Built with ❤️ for the GenLayer Hackathon</sub>
</div>
```