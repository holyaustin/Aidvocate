// frontend/app/components/Leaderboard.tsx
"use client";

import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { AddressDisplay } from "./AddressDisplay";

interface LeaderboardEntry {
  address: string;
  points: number;
}

interface LeaderboardProps {
  data: LeaderboardEntry[];
  currentAddress: string | null;
  isLoading?: boolean;
}

export function Leaderboard({ data, currentAddress, isLoading = false }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="brand-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Leaderboard
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="brand-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Leaderboard
        </h2>
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm text-muted-foreground">No points yet</p>
          <p className="text-xs text-muted-foreground mt-1">Win disputes to earn points!</p>
        </div>
      </div>
    );
  }

  const topPlayers = data.slice(0, 10);

  return (
    <div className="brand-card p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" />
        Leaderboard
      </h2>

      <div className="space-y-2">
        {topPlayers.map((entry, index) => {
          const isCurrentUser = currentAddress?.toLowerCase() === entry.address?.toLowerCase();
          const rank = index + 1;

          return (
            <div
              key={entry.address}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${isCurrentUser ? "bg-accent/20 border-2 border-accent/50" : "hover:bg-white/5"}
              `}
            >
              <div className="flex-shrink-0 w-8 flex items-center justify-center">
                {rank === 1 && <Trophy className="w-5 h-5 text-yellow-400" />}
                {rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                {rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                {rank > 3 && <span className="text-sm font-bold text-muted-foreground">#{rank}</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <AddressDisplay address={entry.address} maxLength={10} className="text-sm" showCopy={true} />
                  {isCurrentUser && (
                    <span className="text-xs bg-accent/30 text-accent px-2 py-0.5 rounded-full font-semibold">You</span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-accent">{entry.points}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length > 10 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-center text-muted-foreground">Showing top 10 of {data.length} players</p>
        </div>
      )}
    </div>
  );
}