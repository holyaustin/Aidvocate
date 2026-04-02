// frontend/app/page.tsx
"use client";

import { Navbar } from "@/components/Navbar";
import { DisputeCard } from "@/components/DisputeCard";
import { Leaderboard } from "@/components/Leaderboard";
import { useDisputesByParty, useStats, useLeaderboard } from "@/lib/hooks/useAidvocate";
import { useWallet } from "@/lib/genlayer/wallet";
import Link from "next/link";
import { Scale, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function HomePage() {
  const { address, isConnected } = useWallet();
  const { data: disputes = [], isLoading: disputesLoading } = useDisputesByParty(isConnected ? address : null);
  const { data: stats } = useStats();
  const { data: leaderboard = [] } = useLeaderboard();

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 2: return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 1: return <Clock className="w-4 h-4 text-blue-400" />;
      case 3: return <AlertCircle className="w-4 h-4 text-purple-400" />;
      default: return <Scale className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "Pending";
      case 1: return "Under Review";
      case 2: return "Resolved";
      case 3: return "Appealed";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
              <Scale className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">AI-Powered Justice</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Aidvocate
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Decentralized dispute resolution powered by AI consensus.
              <br />
              Fair, transparent, and built on GenLayer.
            </p>
          </div>

          {/* Stats Section */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
              <div className="brand-card p-4 text-center">
                <p className="text-3xl font-bold text-accent">{stats.total_disputes}</p>
                <p className="text-sm text-muted-foreground">Total Disputes</p>
              </div>
              <div className="brand-card p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
              <div className="brand-card p-4 text-center">
                <p className="text-3xl font-bold text-purple-400">{stats.appealed}</p>
                <p className="text-sm text-muted-foreground">Appealed</p>
              </div>
              <div className="brand-card p-4 text-center">
                <p className="text-3xl font-bold text-orange-400">{stats.dev_fee_rate}%</p>
                <p className="text-sm text-muted-foreground">Dev Fee</p>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left: Disputes List */}
            <div className="lg:col-span-8 animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {isConnected ? "Your Disputes" : "Recent Disputes"}
                </h2>
                <Link href="/submit">
                  <button className="btn-primary text-sm">
                    + New Dispute
                  </button>
                </Link>
              </div>
              
              {disputesLoading ? (
                <div className="brand-card p-12 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ) : disputes.length === 0 ? (
                <div className="brand-card p-12 text-center">
                  <Scale className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {isConnected ? "You haven't created or been involved in any disputes yet." : "Connect your wallet to view your disputes."}
                  </p>
                  {isConnected && (
                    <Link href="/submit">
                      <button className="btn-primary">Start Your First Dispute →</button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((dispute) => (
                    <DisputeCard key={dispute.id} dispute={dispute} userAddress={address || undefined} />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Leaderboard */}
            <div className="lg:col-span-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <Leaderboard data={leaderboard} currentAddress={address} />
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-12 brand-card p-6 md:p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl font-bold mb-4 text-center">How Aidvocate Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold text-accent">1</span>
                </div>
                <h3 className="font-bold text-lg">Submit Dispute</h3>
                <p className="text-sm text-muted-foreground">
                  Deposit the disputed amount in GEN and upload evidence. The dispute is sent to 5 AI validators.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold text-accent">2</span>
                </div>
                <h3 className="font-bold text-lg">AI Consensus</h3>
                <p className="text-sm text-muted-foreground">
                  Validators analyze evidence and reach consensus using the Equivalence Principle.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold text-accent">3</span>
                </div>
                <h3 className="font-bold text-lg">Appeal Option</h3>
                <p className="text-sm text-muted-foreground">
                  Disagree? Appeal within 7 days to trigger 1,000 validators for a final binding decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}