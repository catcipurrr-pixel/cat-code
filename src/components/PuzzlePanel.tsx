"use client";
import { useEffect, useState } from "react";
import type { GameState } from "@/lib/useGameState";
import { useNow, useSlot } from "@/lib/useGameState";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { buildFinalizeTx, getProgram, sendAndConfirm } from "@/lib/program";
import { CONFIG, explorerUrl, fmtTime } from "@/config";
import GuessPanel from "./GuessPanel";

interface CipherFile { cipher: string; hint?: string; title?: string }

/** Cipher text is NOT bundled; it is fetched only after unlock from CONFIG.cipherUrlTemplate. */
function useCipher(roundId: number | null, unlocked: boolean) {
  const [state, setState] = useState<{ data: CipherFile | null; err: string | null }>({ data: null, err: null });
  useEffect(() => {
    if (!unlocked || roundId == null) return;
    let cancelled = false;
    const url = CONFIG.cipherUrlTemplate.replace("{id}", String(roundId));
    fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: CipherFile) => !cancelled && setState({ data: d, err: null }))
      .catch(() => !cancelled && setState({ data: null, err: "Cipher file not published yet. Check back in a moment." }));
    return () => { cancelled = true; };
  }, [roundId, unlocked]);
  return state;
}

function FinalizeButton({ game }: { game: GameState }) {
  const round = game.round!;
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { sendTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function run() {
    if (!wallet) return setVisible(true);
    setBusy(true); setMsg(null);
    try {
      const program = getProgram(connection, wallet);
      const tx = await buildFinalizeTx(program, round.id, new PublicKey(round.candidate!));
      await sendAndConfirm(connection, sendTransaction, wallet.publicKey, tx);
      setMsg("Round finalized. Payouts sent.");
      game.refresh();
    } catch (e) { setMsg(e instanceof Error ? e.message.slice(0, 200) : String(e)); }
    finally { setBusy(false); }
  }
  return (
    <div className="guess">
      <button className="btn-neon" onClick={run} disabled={busy}>{busy ? "SENDING…" : "FINALIZE ROUND (PAY WINNER)"}</button>
      <p className="muted small">Permissionless: anyone can settle the round once the reveal window has closed. You only pay the network fee.</p>
      {msg && <p className="msg info">{msg}</p>}
    </div>
  );
}

export default function PuzzlePanel({ game }: { game: GameState }) {
  const now = useNow();
  const round = game.round;
  const live = game.mode === "onchain" && !!round && (round.status === "open" || round.status === "revealing");
  const unlocked = now != null && now >= game.targetMs;
  const slot = useSlot(live && round!.status === "revealing");
  const roundId = live ? round!.id : game.mode === "fallback" ? 0 : null;
  const cipher = useCipher(roundId, unlocked);
  const paused = !!game.config?.paused;

  if (game.mode === "onchain" && round && round.status === "solved") {
    return (
      <section className="panel puzzle">
        <h2 className="panel-title">// ROUND_{round.id}_SOLVED</h2>
        <p>
          Solver{" "}
          <a href={explorerUrl("address", round.solver ?? "")} target="_blank" rel="noreferrer">{short(round.solver)}</a>{" "}
          claimed {round.solverPayoutSol.toFixed(4)} SOL · {round.holderPayoutSol.toFixed(4)} SOL to holders.
        </p>
        <p className="muted">Next round will be announced here. The answer is listed under Past Rounds.</p>
      </section>
    );
  }

  if (!live || !unlocked) {
    const ended = game.mode === "onchain" && round && (round.status === "expired" || round.status === "cancelled");
    return (
      <section className="panel puzzle">
        <h2 className="panel-title">// PUZZLE_LOCKED</h2>
        <p>Cipher stays sealed until countdown hits zero.</p>
        {ended && <p className="muted small" style={{ marginTop: 8 }}>Round {round!.id} {round!.status}. Vault rolls over to the next round.</p>}
        {paused && <p className="warn small" style={{ marginTop: 8 }}>Game paused by owner.</p>}
      </section>
    );
  }

  const r = round!;
  const windowClosed = r.status === "revealing" && slot != null && slot > r.revealWindowEndSlot;
  return (
    <section className="panel puzzle">
      <h2 className="panel-title">// {r.status === "revealing" ? "ANSWER_REVEALED" : "PUZZLE_UNLOCKED"} · ROUND_{r.id}</h2>
      {cipher.data ? (
        <>
          {cipher.data.title && <div className="muted">{cipher.data.title}</div>}
          <pre className="cipher">{cipher.data.cipher}</pre>
          {cipher.data.hint && <p className="muted">hint: {cipher.data.hint}</p>}
        </>
      ) : (
        <p className="muted">{cipher.err ?? "Decrypting transmission…"}</p>
      )}
      <p className="muted small" style={{ marginTop: 10 }}>
        commits: {r.totalCommits} · deadline {fmtTime(r.deadlineTs * 1000)} · fingerprint{" "}
        <code title={r.answerCommitmentHex}>{r.answerCommitmentHex.slice(0, 16)}…</code>
      </p>
      {r.status === "revealing" && (
        <p className="warn" style={{ marginTop: 10 }}>
          Candidate {short(r.candidate)} (committed at slot {r.candidateCommitSlot}). Earliest-commit-wins window
          {windowClosed ? " closed" : ` open until slot ${r.revealWindowEndSlot}${slot != null ? ` (now ${slot})` : ""}`}.
        </p>
      )}
      {windowClosed ? <FinalizeButton game={game} /> : <GuessPanel game={game} />}
    </section>
  );
}

export const short = (s?: string | null) => (s ? `${s.slice(0, 4)}…${s.slice(-4)}` : "—");
