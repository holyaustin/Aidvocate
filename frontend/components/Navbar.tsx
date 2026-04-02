"use client";

import { useState, useEffect } from "react";
import { AccountPanel } from "./AccountPanel";
import { CreateDisputeModal } from "./CreateDisputeModal";
import { useDisputes } from "@/lib/hooks/useAidvocate";
import { Scale } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: disputes } = useDisputes();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pendingCount = disputes?.filter(d => d.status === "pending").length || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <div className="backdrop-blur-xl border-b border-white/10 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                Aidvocate
              </span>
            </div>

            {/* Center Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Pending Cases:</span>
                <span className="font-bold text-accent">{pendingCount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <CreateDisputeModal />
              <AccountPanel />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}