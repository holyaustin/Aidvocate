"use client";

import { Navbar } from "@/components/Navbar";
import { DisputesTable } from "@/components/DisputesTable";
import { StatsPanel } from "@/components/StatsPanel";
import { Scale, Shield, Brain, Gavel } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Scale className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">AI-Powered Justice</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-purple-400 bg-clip-text text-transparent">
              Aidvocate
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The world's first decentralized dispute resolution oracle using 
              <span className="text-accent font-semibold"> Optimistic Democracy</span>. 
              AI validators resolve conflicts with human-level reasoning, 
              backed by blockchain transparency.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="brand-card p-6 brand-card-hover">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI Consensus</h3>
              <p className="text-sm text-muted-foreground">
                Multiple LLM validators analyze evidence and reach consensus using 
                GenLayer's Equivalence Principle.
              </p>
            </div>
            <div className="brand-card p-6 brand-card-hover">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Optimistic Democracy</h3>
              <p className="text-sm text-muted-foreground">
                Fast resolution with small validator sets. Appeals trigger 
                expanded consensus for edge cases.
              </p>
            </div>
            <div className="brand-card p-6 brand-card-hover">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                <Gavel className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Fair & Transparent</h3>
              <p className="text-sm text-muted-foreground">
                All evidence stored on IPFS via Pinata. Resolution reasoning 
                is fully transparent and auditable.
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Disputes Table (67%) */}
            <div className="lg:col-span-8 animate-slide-up">
              <DisputesTable />
            </div>

            {/* Right Column - Stats (33%) */}
            <div className="lg:col-span-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <StatsPanel />
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-12 brand-card p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl font-bold mb-8 text-center">How Aidvocate Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-accent font-bold text-lg">1</div>
                <h3 className="font-semibold">Submit Dispute</h3>
                <p className="text-sm text-muted-foreground">
                  Upload evidence to Pinata IPFS and escrow funds
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-accent font-bold text-lg">2</div>
                <h3 className="font-semibold">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Validators fetch evidence and analyze using LLMs
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-accent font-bold text-lg">3</div>
                <h3 className="font-semibold">Consensus</h3>
                <p className="text-sm text-muted-foreground">
                  Equivalence Principle ensures fair agreement
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-accent font-bold text-lg">4</div>
                <h3 className="font-semibold">Appeal if Needed</h3>
                <p className="text-sm text-muted-foreground">
                  Request full validator review with new evidence
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-accent" />
              <span className="font-bold">Aidvocate</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                Powered by GenLayer
              </a>
              <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                IPFS by Pinata
              </a>
              <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}