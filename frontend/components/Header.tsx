// frontend/app/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AccountPanel } from "./AccountPanel";
import { Logo, LogoMark } from "./Logo";
import { useStats } from "@/lib/hooks/useAidvocate";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { data: stats } = useStats();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      const progress = Math.min(Math.max((scrollY - 10) / 80, 0), 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const paddingTop = Math.round(scrollProgress * 16);
  const headerHeight = 64 - Math.round(scrollProgress * 8);

  const totalDisputes = stats?.total_disputes || 0;
  const resolvedDisputes = stats?.resolved || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out" style={{ paddingTop: `${paddingTop}px` }}>
      <div className="transition-all duration-500 ease-out" style={{ width: '100%', maxWidth: isScrolled ? '80rem' : '100%', margin: '0 auto' }}>
        <div className="backdrop-blur-xl border transition-all duration-500 ease-out" style={{
          borderColor: `oklch(0.3 0.02 0 / ${0.4 + scrollProgress * 0.4})`,
          background: `linear-gradient(135deg, oklch(0.18 0.01 0 / ${0.1 + scrollProgress * 0.3}) 0%, oklch(0.15 0.01 0 / ${0.05 + scrollProgress * 0.25}) 50%, oklch(0.16 0.01 0 / ${0.08 + scrollProgress * 0.27}) 100%)`,
          borderRadius: `${Math.round(scrollProgress * 9999)}px`,
          borderWidth: '1px',
          borderLeftWidth: isScrolled ? '1px' : '0px',
          borderRightWidth: isScrolled ? '1px' : '0px',
          borderTopWidth: isScrolled ? '1px' : '0px',
          boxShadow: isScrolled ? '0 32px 64px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 oklch(0.3 0.02 0 / 0.3)' : 'none',
          backdropFilter: 'blur(16px) saturate(180%)',
        }}>
          <div className="px-6 transition-all duration-500 mx-auto" style={{ maxWidth: isScrolled ? '80rem' : '112rem' }}>
            <div className="flex items-center justify-between transition-all duration-500" style={{ height: `${headerHeight}px` }}>
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <LogoMark size="md" className="flex md:hidden" />
                <Logo size="md" className="hidden md:flex" />
                <span className="text-lg md:text-xl font-bold ml-2">Aidvocate</span>
              </Link>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Disputes:</span>
                  <span className="text-foreground font-bold text-accent">{totalDisputes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Resolved:</span>
                  <span className="text-foreground font-bold text-accent">{resolvedDisputes}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link href="/submit">
                  <button className="btn-primary text-sm">+ New Dispute</button>
                </Link>
                <AccountPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}