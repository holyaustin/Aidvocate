// frontend/app/components/Footer.tsx
import Link from "next/link";
import { Scale, Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-accent" />
              <span className="font-bold text-lg">Aidvocate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered decentralized arbitration on GenLayer. Fair, transparent, and efficient dispute resolution.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/submit" className="hover:text-accent transition">New Dispute</Link></li>
              <li><Link href="/dashboard" className="hover:text-accent transition">Dashboard</Link></li>
              <li><Link href="/leaderboard" className="hover:text-accent transition">Leaderboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">Documentation</a></li>
              <li><a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">GenLayer</a></li>
              <li><a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">Studio</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Community</h3>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/genlayer" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Built on GenLayer • Earn forever with 20% dev fee
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-muted-foreground">
          © 2025 Aidvocate. All rights reserved. Powered by GenLayer AI Blockchain.
        </div>
      </div>
    </footer>
  );
}