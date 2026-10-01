"use client";
import type { GameState } from "@/lib/useGameState";
import { useNow } from "@/lib/useGameState";
import { CONFIG, fmtTime } from "@/config";

export function formatHMS(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}`;
}

export default function StatPanels({ game }: { game: GameState }) {
  const now = useNow();
  const remaining = now == null ? null : game.targetMs - now;
  const vaultLabel =
    game.mode === "onchain" ? "on-chain vault (spendable)" : game.mode === "fallback" ? "fee wallet (program not live yet)" : "syncing…";
  return (
    <section className="grid-2">
      <div className="panel stat">
        <div className="panel-label">// REWARD_VAULT</div>
        <div className="big-value" aria-live="polite">
          {game.vaultSol == null ? "-.---- SOL" : `${game.vaultSol.toFixed(4)} SOL`}
        </div>
        <div className="panel-sub">
          {vaultLabel}
          {game.mode === "fallback" && (
            <> · <a href={`https://solscan.io/account/${CONFIG.feeWallet}`} target="_blank" rel="noreferrer">view</a></>
          )}
        </div>
      </div>
      <div className="panel stat">
        <div className="panel-label">// GAME_START_TIMESTAMP</div>
        <div className="big-value countdown" aria-live="off">
          {remaining == null ? "--:--:--" : formatHMS(remaining)}
        </div>
        <div className="panel-sub">
          {now == null ? "…" : `unlocks ${fmtTime(game.targetMs)}`}
        </div>
      </div>
    </section>
  );
}
