"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { GameState } from "@/lib/useGameState";
import { useSlot } from "@/lib/useGameState";
import { buildCommitGuessTx, buildRevealTx, fetchGuess, getProgram, sendAndConfirm, toHex, PROGRAM_ID, type GuessView } from "@/lib/program";
import { canonicalize, hexToBytes, randomBytes, saltFromInput, sha256 } from "@/lib/crypto";
import { explorerUrl } from "@/config";

/** Kept only in this browser's localStorage: needed to reveal your own sealed guess. */
interface Pending { saltHex: string; answer: string; nonceHex: string; sig?: string }
const keyFor = (roundId: number, wallet: string) => `catcode:guess:${PROGRAM_ID.toBase58()}:${roundId}:${wallet}`;

const ERRORS: [RegExp, string][] = [
  [/RevealTooEarly/, "Reveal too early — wait for the slot delay."],
  [/WrongAnswer/, "Wrong answer (hash mismatch)."],
  [/CommitmentMismatch/, "Reveal doesn’t match your sealed commitment."],
  [/RoundLocked/, "Round is still locked."],
  [/RoundExpired/, "Round deadline has passed."],
  [/BadRoundState/, "Round is not accepting this action anymore."],
  [/NotEarlierCommit/, "Another solver committed earlier than you — only earlier commits can still reveal."],
  [/RevealWindowClosed/, "Reveal window has closed."],
  [/GuessCooldown/, "Cooldown: wait before committing again."],
  [/TooManyCommits/, "Commit limit reached for this wallet."],
  [/Excluded/, "This wallet is excluded from playing."],
  [/Paused/, "Game is paused by the owner."],
  [/InvalidAnswer/, "Answer must be 1–256 printable ASCII characters."],
  [/User rejected/i, "Transaction rejected in wallet."],
];
function errText(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  for (const [re, t] of ERRORS) if (re.test(m)) return t;
  return m.length > 220 ? m.slice(0, 220) + "…" : m;
}

export default function GuessPanel({ game }: { game: GameState }) {
  const round = game.round!;
  const cfg = game.config;
  const params = cfg?.params;
  const minDelay = params?.minRevealDelaySlots ?? 1;
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const { sendTransaction } = useWallet();
  const program = useMemo(() => (wallet ? getProgram(connection, wallet) : null), [connection, wallet]);

  const [salt, setSalt] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [onchain, setOnchain] = useState<GuessView | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err" | "info"; text: string; sig?: string } | null>(null);
  const slot = useSlot(!!onchain);

  const me = wallet?.publicKey.toBase58();
  const storageKey = me ? keyFor(round.id, me) : null;
  const excluded = !!me && !!cfg?.excluded.includes(me);
  const paused = !!cfg?.paused;
  const revealing = round.status === "revealing";

  useEffect(() => {
    if (!storageKey) { setPending(null); return; }
    const raw = localStorage.getItem(storageKey);
    setPending(raw ? (JSON.parse(raw) as Pending) : null);
  }, [storageKey]);

  const loadGuess = useCallback(async () => {
    if (!program || !wallet) return;
    try { setOnchain(await fetchGuess(program, round.id, wallet.publicKey)); } catch { /* ignore */ }
  }, [program, wallet, round.id]);
  useEffect(() => { loadGuess(); }, [loadGuess]);

  const revealAtSlot = onchain ? onchain.commitSlot + minDelay : null;
  const earlierThanCandidate = !revealing || (onchain != null && onchain.commitSlot < round.candidateCommitSlot);
  const windowOpen = !revealing || (slot != null && slot <= round.revealWindowEndSlot);
  const delayDone = slot != null && revealAtSlot != null && slot >= revealAtSlot;
  const canReveal = !!(pending && onchain && delayDone && earlierThanCandidate && windowOpen && !paused);
  const cooldownUntil = onchain && params ? onchain.commitSlot + params.guessCooldownSlots : 0;

  async function commit() {
    if (!wallet || !program) return setVisible(true);
    setMsg(null);
    let saltBytes: Uint8Array, ans: Uint8Array;
    try {
      if (!salt.trim()) throw new Error("Enter the salt phrase (or 64-hex salt) hidden in the cipher.");
      ans = canonicalize(answer);
      saltBytes = await saltFromInput(salt);
    } catch (e) { return setMsg({ kind: "err", text: (e as Error).message }); }
    // Local pre-check against the public on-chain fingerprint (saves you a fee + failed reveal).
    if (toHex(await sha256(saltBytes, ans)) !== round.answerCommitmentHex)
      return setMsg({ kind: "err", text: "No match: sha256(salt ‖ answer) ≠ on-chain fingerprint. Keep decoding." });

    const nonce = randomBytes(32);
    const commitment = await sha256(saltBytes, ans, wallet.publicKey.toBytes(), nonce);
    const p: Pending = { saltHex: toHex(saltBytes), answer: new TextDecoder().decode(ans), nonceHex: toHex(nonce) };
    localStorage.setItem(storageKey!, JSON.stringify(p)); // saved BEFORE sending so a crash can't lose the nonce
    setPending(p);
    setBusy(true);
    try {
      const tx = await buildCommitGuessTx(program, round.id, wallet.publicKey, commitment);
      const sig = await sendAndConfirm(connection, sendTransaction, wallet.publicKey, tx);
      localStorage.setItem(storageKey!, JSON.stringify({ ...p, sig }));
      setMsg({ kind: "ok", text: `Sealed guess committed. Reveal unlocks after ${minDelay} slot(s).`, sig });
      await loadGuess();
    } catch (e) {
      setMsg({ kind: "err", text: errText(e) });
    } finally { setBusy(false); }
  }

  async function reveal() {
    if (!wallet || !program || !pending) return;
    setBusy(true); setMsg(null);
    try {
      const tx = await buildRevealTx(program, round.id, wallet.publicKey,
        hexToBytes(pending.saltHex)!, new TextEncoder().encode(pending.answer), hexToBytes(pending.nonceHex)!);
      const sig = await sendAndConfirm(connection, sendTransaction, wallet.publicKey, tx);
      setMsg({ kind: "ok", text: "Revealed! You’re the current candidate. Earliest commit wins once the reveal window closes. 🐾", sig });
      game.refresh();
      await loadGuess();
    } catch (e) {
      setMsg({ kind: "err", text: errText(e) });
    } finally { setBusy(false); }
  }

  function forget() {
    if (storageKey) localStorage.removeItem(storageKey);
    setPending(null);
  }

  const isCandidate = revealing && me && round.candidate === me;

  return (
    <div className="guess">
      <div className="steps">
        <span className={!onchain ? "step active" : "step done"}>[1] COMMIT</span>
        <span className="step-sep">→</span>
        <span className={isCandidate ? "step done" : canReveal ? "step active" : onchain ? "step wait" : "step"}>[2] REVEAL</span>
      </div>
      {paused && <p className="warn">Game is paused by the owner. Commits and reveals are disabled.</p>}
      {excluded && <p className="warn">This wallet is on the program’s exclusion list and cannot play.</p>}

      {!wallet ? (
        <button className="btn-neon" onClick={() => setVisible(true)}>Connect wallet to play</button>
      ) : isCandidate ? (
        <p className="msg ok">You are the current candidate. If no earlier commitment reveals before slot {round.revealWindowEndSlot}, the vault is yours.</p>
      ) : onchain && pending ? (
        <div className="reveal-box">
          <p>
            Sealed at slot <b>{onchain.commitSlot}</b>. Reveal allowed from slot <b>{revealAtSlot}</b>
            {slot != null && <> · current <b>{slot}</b></>}.
          </p>
          {revealing && !earlierThanCandidate && (
            <p className="warn">A solver who committed earlier (slot {round.candidateCommitSlot}) already revealed. Only earlier commitments can still win.</p>
          )}
          <button className="btn-neon" disabled={!canReveal || busy} onClick={reveal}>
            {busy ? "SENDING…" : canReveal ? "REVEAL ANSWER" : !delayDone ? `WAIT ${Math.max(0, (revealAtSlot ?? 0) - (slot ?? 0))} SLOT(S)` : "REVEAL UNAVAILABLE"}
          </button>
          <button className="btn-link" onClick={forget} disabled={busy}>discard local guess</button>
        </div>
      ) : revealing ? (
        <p className="muted">The answer has been revealed on-chain. New commitments are closed; only wallets that had already committed earlier can still reveal.</p>
      ) : (
        <form className="guess-form" onSubmit={(e) => { e.preventDefault(); commit(); }}>
          {onchain && !pending && (
            <p className="warn">A commitment exists for this wallet but its secret nonce isn’t in this browser. Committing again replaces it{slot != null && slot < cooldownUntil ? ` (cooldown until slot ${cooldownUntil})` : ""}.</p>
          )}
          <label>
            <span>salt phrase or 64-hex salt (hidden in the cipher)</span>
            <input value={salt} onChange={(e) => setSalt(e.target.value)} placeholder="salt" spellCheck={false} autoComplete="off" />
          </label>
          <label>
            <span>decoded answer</span>
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="your plaintext guess" spellCheck={false} autoComplete="off" />
          </label>
          <button className="btn-neon" type="submit" disabled={busy || paused || excluded}>{busy ? "SENDING…" : "COMMIT SEALED GUESS"}</button>
          <p className="muted small">
            Commit fee {params ? `${params.guessFeeSol} SOL` : "—"} (goes to the vault). Answers are canonicalized (ASCII, lowercase,
            single spaces). Your guess is checked locally against the public fingerprint, then sealed with a random nonce bound to your
            wallet — nothing readable is broadcast until you reveal. The nonce is stored only in this browser.
          </p>
        </form>
      )}
      {msg && (
        <p className={`msg ${msg.kind}`}>
          {msg.text}{" "}
          {msg.sig && <a href={explorerUrl("tx", msg.sig)} target="_blank" rel="noreferrer">tx ↗</a>}
        </p>
      )}
    </div>
  );
}
