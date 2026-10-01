"use client";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGameState } from "@/lib/useGameState";
import { CONFIG, connectionArgs, explorerUrl, fmtTime, STATIC_BUILD } from "@/config";
import { PROGRAM_ID, pda } from "@/lib/program";

/**
 * READ-ONLY operator status. This page intentionally has no forms and no admin instructions:
 * it never accepts, displays or stores answers, salts, or private keys. Round management
 * (start_round, etc.) must be done from offline/multisig tooling, not from this website.
 */
function Row({ k, v, href }: { k: string; v: React.ReactNode; href?: string }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className="v">{href ? <a href={href} target="_blank" rel="noreferrer">{v}</a> : v}</span>
    </div>
  );
}

export default function AdminPage() {
  const game = useGameState();
  const { connection } = useConnection();
  const [slot, setSlot] = useState<number | null>(null);
  useEffect(() => { connection.getSlot().then(setSlot).catch(() => setSlot(null)); }, [connection, game.lastUpdated]);
  const c = game.config, r = game.round;
  const yes = (b: boolean) => (b ? "TRUE" : "FALSE");
  const ts = (s: number) => (s ? fmtTime(s * 1000) : "—");

  return (
    <main className="shell">
      <Header admin />
      <section className="panel">
        <h2 className="panel-title">// SYSTEM</h2>
        <Row k="mode" v={game.mode === "onchain" ? "ON-CHAIN" : game.mode === "fallback" ? "FALLBACK (program not deployed/initialized)" : "LOADING…"} />
        <Row k="cluster" v={CONFIG.cluster} />
        <Row k="rpc (browser)" v={STATIC_BUILD && !process.env.NEXT_PUBLIC_RPC_URL ? `${connectionArgs("main").endpoint} (+ public fallbacks)` : CONFIG.rpcUrl.startsWith("/") ? `${CONFIG.rpcUrl} (server proxy; upstream hidden)` : CONFIG.rpcUrl} />
        <Row k="program_id" v={PROGRAM_ID.toBase58()} href={explorerUrl("address", PROGRAM_ID.toBase58())} />
        <Row k="program_deployed" v={game.programDeployed == null ? "…" : yes(game.programDeployed)} />
        <Row k="current_slot" v={slot ?? "—"} />
        <Row k="last_sync" v={game.lastUpdated ? `${new Date(game.lastUpdated).toLocaleTimeString("en-US", { timeZone: "America/Toronto" })} ET` : "—"} />
        {game.error && <Row k="error" v={<span className="err">{game.error}</span>} />}
      </section>

      <div className="grid-2 info">
        <section className="panel">
          <h2 className="panel-title">// CONFIG</h2>
          {c ? (
            <>
              <Row k="config_pda" v={pda.config().toBase58()} href={explorerUrl("address", pda.config().toBase58())} />
              <Row k="owner" v={c.owner} href={explorerUrl("address", c.owner)} />
              <Row k="pending_owner" v={c.pendingOwner ?? "none"} />
              <Row k="operator" v={c.operator ?? "—"} href={c.operator ? explorerUrl("address", c.operator) : undefined} />
              <Row k="paused" v={c.paused == null ? "n/a (no pause flag in this build)" : c.paused ? <span className="warn">TRUE</span> : "FALSE"} />
              <Row k="fee_wallet" v={c.feeWallet ? <>{c.feeWallet}{c.feeWallet !== CONFIG.feeWallet && <span className="warn"> (≠ site config {CONFIG.feeWallet})</span>}</> : "—"} />
              <Row k="token_mint" v={<>{c.tokenMint}{c.tokenMint !== CONFIG.token.ca && <span className="warn"> (≠ site CA)</span>}</>} />
              <Row k="round_active" v={yes(c.roundActive)} />
              <Row k="round_count" v={c.roundCount} />
              <Row k="pending_publish_round" v={c.pendingPublishRound ?? "none"} />
              <Row k="distribution_count" v={c.distributionCount} />
              <Row k="excluded_wallets" v={c.excluded.length ? c.excluded.join(", ") : "none"} />
              <div className="kv"><span className="k muted">params</span><span className="v" /></div>
              <Row k="min_reveal_delay_slots" v={c.params.minRevealDelaySlots} />
              <Row k="reveal_window_slots" v={c.params.revealWindowSlots} />
              <Row k="guess_fee" v={`${c.params.guessFeeSol} SOL`} />
              <Row k="guess_cooldown_slots" v={c.params.guessCooldownSlots} />
              <Row k="max_commits_per_wallet" v={c.params.maxCommitsPerWallet || "unlimited"} />
              <Row k="max_round_duration" v={`${(c.params.maxRoundDurationSecs / 86400).toFixed(1)} days`} />
              <Row k="max_distribution" v={`${c.params.maxDistributionSol} SOL`} />
              <Row k="max_claim" v={`${c.params.maxClaimSol} SOL`} />
            </>
          ) : (
            <p className="muted">Config account not found at {pda.config().toBase58()} — program not deployed/initialized on {CONFIG.cluster}.</p>
          )}
        </section>
        <section className="panel">
          <h2 className="panel-title">// ROUND</h2>
          {r ? (
            <>
              <Row k="round_id" v={r.id} />
              <Row k="round_pda" v={r.address} href={explorerUrl("address", r.address)} />
              <Row k="status" v={r.status.toUpperCase()} />
              <Row k="answer_fingerprint" v={<code className="addr">{r.answerCommitmentHex}</code>} />
              <Row k="answer_published" v={yes(r.answerPublished)} />
              <Row k="started_at" v={ts(r.startedAt)} />
              <Row k="unlock_ts" v={ts(r.unlockTs)} />
              <Row k="deadline_ts" v={ts(r.deadlineTs)} />
              <Row k="total_commits" v={r.totalCommits} />
              <Row k="candidate" v={r.candidate ?? "—"} />
              <Row k="candidate_commit_slot" v={r.candidateCommitSlot || "—"} />
              <Row k="reveal_window_end_slot" v={r.revealWindowEndSlot || "—"} />
              <Row k="solver" v={r.solver ?? "—"} />
              <Row k="solved_at" v={ts(r.solvedAt)} />
              <Row k="solver_payout" v={`${r.solverPayoutSol.toFixed(4)} SOL`} />
              <Row k="holder_payout" v={`${r.holderPayoutSol.toFixed(4)} SOL`} />
            </>
          ) : (
            <p className="muted">No rounds on-chain yet. Fallback countdown target: {fmtTime(CONFIG.fallbackCountdownTargetMs)}</p>
          )}
        </section>
      </div>

      <section className="panel">
        <h2 className="panel-title">// BALANCES</h2>
        <Row k={game.mode === "onchain" ? "vault (spendable)" : "fee wallet (fallback vault)"} v={game.vaultSol == null ? "—" : `${game.vaultSol.toFixed(4)} SOL`} />
        {game.mode === "onchain" && <Row k="holder_pool (spendable)" v={game.holderPoolSol == null ? "—" : `${game.holderPoolSol.toFixed(4)} SOL`} />}
        <Row k="vault_pda" v={pda.vault().toBase58()} />
        <Row k="holder_pool_pda" v={pda.holderPool().toBase58()} />
        <Row k="fee_wallet" v={CONFIG.feeWallet} href={explorerUrl("address", CONFIG.feeWallet, "mainnet-beta")} />
        <p className="muted small">Read-only. This page never shows or handles answers, salts or keys. Admin actions belong in offline / multisig tooling.</p>
      </section>
      <Footer />
    </main>
  );
}
