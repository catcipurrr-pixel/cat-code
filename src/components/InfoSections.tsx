"use client";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { CONFIG, explorerUrl } from "@/config";
import { fetchRounds, getProgram, toHex, type RoundView } from "@/lib/program";
import { canonicalize, hexToBytes, sha256 } from "@/lib/crypto";
import type { GameState } from "@/lib/useGameState";

export function HowItWorks() {
  const { solver, holders, nextRound } = CONFIG.split;
  return (
    <section className="panel">
      <h2 className="panel-title">// HOW_IT_WORKS</h2>
      <ol className="how">
        <li><b>Hold.</b> Trading fees from the token fund the on-chain reward vault.</li>
        <li><b>Decode.</b> When the countdown hits zero, the cipher drops. Only a hash fingerprint of the answer lives on-chain.</li>
        <li><b>Commit → Reveal.</b> Seal your guess (hash + secret nonce bound to your wallet), wait a few slots, then reveal. Copy-paste snipers can’t steal it.</li>
        <li><b>Claim the vault.</b> The first valid reveal opens a short window where only earlier commitments can override it (earliest commit wins). Then anyone can finalize and the vault pays out:</li>
      </ol>
      <div className="split">
        <div className="split-cell"><div className="split-pct">{solver}%</div><div>solver</div></div>
        <div className="split-cell"><div className="split-pct">{holders}%</div><div>longest holders</div></div>
        <div className="split-cell"><div className="split-pct">{nextRound}%</div><div>seeds next round</div></div>
      </div>
      <div className="bar" aria-hidden="true">
        <span style={{ width: `${solver}%` }} /><span style={{ width: `${holders}%` }} /><span style={{ width: `${nextRound}%` }} />
      </div>
    </section>
  );
}

function CopyRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); } catch {
      const t = document.createElement("textarea"); t.value = value; document.body.appendChild(t); t.select();
      document.execCommand("copy"); t.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="copy-row">
      <div className="copy-label">{label}</div>
      <div className="copy-line">
        <code className="addr">{value}</code>
        <button className="btn-outline sm" onClick={copy} aria-label={`Copy ${label}`}>{copied ? "COPIED" : "COPY"}</button>
        {href && <a className="btn-outline sm" href={href} target="_blank" rel="noreferrer">VIEW ↗</a>}
      </div>
    </div>
  );
}

export function TokenInfo() {
  return (
    <section className="panel">
      <h2 className="panel-title">// TOKEN_INFO</h2>
      <CopyRow label="CA" value={CONFIG.token.ca} href={CONFIG.token.pumpUrl} />
      <CopyRow label="FEE_WALLET" value={CONFIG.feeWallet} href={explorerUrl("address", CONFIG.feeWallet, "mainnet-beta")} />
      <a className="btn-neon pump" href={CONFIG.token.pumpUrl} target="_blank" rel="noreferrer">BUY ON PUMP.FUN ↗</a>
    </section>
  );
}

interface PublishedRound { id: number; answer: string; saltHex?: string; solver?: string; payoutSol?: number; date?: string; tx?: string }
interface Row { id: number; status: string; answer: string | null; saltHex: string | null; solver: string | null; payoutSol: number | null; fingerprint: string | null; source: "chain" | "file" }

/**
 * Past rounds. Answers come ONLY from (a) the program itself, which records the salt+answer once
 * they became public (first valid reveal or publish_answer), or (b) /rounds.json, which the
 * operator edits after a round closes. Nothing about the current round is bundled.
 */
export function PastRounds({ game }: { game: GameState }) {
  const { connection } = useConnection();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [verified, setVerified] = useState<Record<number, "ok" | "bad" | "n/a">>({});
  const roundCount = game.config?.roundCount ?? 0;
  const latestStatus = game.round?.status;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const file: PublishedRound[] = await fetch(CONFIG.pastRoundsUrl, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : {})).then((d: { rounds?: PublishedRound[] }) => d.rounds ?? []).catch(() => []);
      let chain: RoundView[] = [];
      if (game.mode === "onchain" && roundCount > 0) {
        const ids = Array.from({ length: Math.min(roundCount, 25) }, (_, i) => roundCount - 1 - i);
        chain = await fetchRounds(getProgram(connection), ids).catch(() => []);
      }
      const out: Row[] = [];
      for (const r of chain) {
        if (r.status === "open" || r.status === "revealing" || r.status === "unknown") continue; // never list a live round
        const f = file.find((x) => x.id === r.id);
        out.push({
          id: r.id, status: r.status, source: "chain", fingerprint: r.answerCommitmentHex,
          answer: r.publishedAnswer ?? f?.answer ?? null, saltHex: r.publishedSaltHex ?? f?.saltHex ?? null,
          solver: r.solver, payoutSol: r.status === "solved" ? r.solverPayoutSol : null,
        });
      }
      for (const f of file) if (!out.some((o) => o.id === f.id) && !chain.some((c) => c.id === f.id))
        out.push({ id: f.id, status: "closed", source: "file", fingerprint: null, answer: f.answer, saltHex: f.saltHex ?? null, solver: f.solver ?? null, payoutSol: f.payoutSol ?? null });
      out.sort((a, b) => b.id - a.id);
      if (!cancelled) setRows(out);
    })();
    return () => { cancelled = true; };
  }, [connection, game.mode, roundCount, latestStatus]);

  async function verify(r: Row) {
    try {
      const salt = r.saltHex ? hexToBytes(r.saltHex) : null;
      if (!r.fingerprint || !salt || !r.answer) return setVerified((v) => ({ ...v, [r.id]: "n/a" }));
      const h = toHex(await sha256(salt, canonicalize(r.answer)));
      setVerified((v) => ({ ...v, [r.id]: h === r.fingerprint ? "ok" : "bad" }));
    } catch { setVerified((v) => ({ ...v, [r.id]: "n/a" })); }
  }

  return (
    <section className="panel">
      <h2 className="panel-title">// PAST_ROUNDS</h2>
      <p className="muted small">Answers appear only after a round closes (recorded on-chain at the first valid reveal or via publish_answer), so anyone can verify them against the round’s fingerprint.</p>
      {rows == null ? (
        <p className="muted">loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">&gt; no rounds closed yet. round_0 pending_</p>
      ) : (
        <div className="table-wrap">
          <table className="rounds">
            <thead><tr><th>#</th><th>status</th><th>answer</th><th>solver</th><th>payout</th><th>verify</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.status}</td>
                  <td>{r.answer ? <code>{r.answer}</code> : <span className="muted">unpublished</span>}</td>
                  <td>{r.solver ? <a href={explorerUrl("address", r.solver)} target="_blank" rel="noreferrer">{r.solver.slice(0, 4)}…{r.solver.slice(-4)}</a> : "—"}</td>
                  <td>{r.payoutSol != null ? `${r.payoutSol.toFixed(4)} SOL` : "—"}</td>
                  <td>
                    <button className="btn-outline sm" onClick={() => verify(r)} disabled={!r.answer || !r.fingerprint}>
                      {{ ok: "✓ MATCH", bad: "✗ MISMATCH", "n/a": "N/A" }[verified[r.id] as string] ?? "CHECK"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
