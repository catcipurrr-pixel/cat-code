"use client";
import type { GameState } from "@/lib/useGameState";
import { useNow } from "@/lib/useGameState";
import { fmtOpens, fmtTime, weekdayShort } from "@/config";

export function formatHMS(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}`;
}

/**
 * REWARD_VAULT shows a SOL figure ONLY in on-chain mode (the program's vault PDA).
 * Before the program is live there is no vault, so it shows an "OPENS <DAY>" headline instead.
 */
function VaultPanel({ game, now }: { game: GameState; now: number | null }) {
  let headline: string, sub: string;
  if (game.mode === "onchain") {
    headline = game.vaultSol == null ? "-.---- SOL" : `${game.vaultSol.toFixed(4)} SOL`;
    sub = "on-chain vault (spendable)";
  } else if (game.mode === "loading") {
    headline = "SYNCING";
    sub = "connecting to Solana…";
  } else {
    const before = now == null || now < game.targetMs;
    headline = before ? `OPENS ${weekdayShort(game.targetMs)}` : "LOCKED";
    sub = before ? `Vault opens ${fmtOpens(game.targetMs)}` : "Vault opens once the on-chain program is live";
  }
  return (
    <div className="panel stat">
      <div className="panel-label">// REWARD_VAULT</div>
      <div className="big-value" aria-live="polite">{headline}</div>
      <div className="panel-sub">{sub}</div>
    </div>
  );
}

export default function StatPanels({ game }: { game: GameState }) {
  const now = useNow();
  const remaining = now == null ? null : game.targetMs - now;
  return (
    <section className="grid-2">
      <VaultPanel game={game} now={now} />
      <div className="panel stat">
        <div className="panel-label">// GAME_START_TIMESTAMP</div>
        <div className="big-value countdown" aria-live="off">
          {remaining == null ? "--:--:--" : formatHMS(remaining)}
        </div>
        <div className="panel-sub">{`unlocks ${fmtTime(game.targetMs)}`}</div>
      </div>
    </section>
  );
}
