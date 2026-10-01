import { AnchorProvider, BN, Program, type Idl } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, type Transaction, type VersionedTransaction } from "@solana/web3.js";
import rawIdl from "@/idl/cat_code.json";
import { CONFIG } from "@/config";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const PROGRAM_ID = new PublicKey(CONFIG.programId);
// Use the configured program ID even if the IDL file's address differs (e.g. after a redeploy).
const IDL = { ...(rawIdl as unknown as Idl), address: PROGRAM_ID.toBase58() } as Idl;

const enc = new TextEncoder();
const u64le = (n: bigint | number) => {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigUint64(0, BigInt(n), true);
  return b;
};

export const pda = {
  config: () => PublicKey.findProgramAddressSync([enc.encode("config")], PROGRAM_ID)[0],
  vault: () => PublicKey.findProgramAddressSync([enc.encode("vault")], PROGRAM_ID)[0],
  holderPool: () => PublicKey.findProgramAddressSync([enc.encode("holder_pool")], PROGRAM_ID)[0],
  round: (id: bigint | number) => PublicKey.findProgramAddressSync([enc.encode("round"), u64le(id)], PROGRAM_ID)[0],
  guess: (round: PublicKey, solver: PublicKey) =>
    PublicKey.findProgramAddressSync([enc.encode("guess"), round.toBytes(), solver.toBytes()], PROGRAM_ID)[0],
};

/** Read-only wallet stub so we can build a Program without a connected wallet. */
const readOnlyWallet: AnchorWallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: async <T extends Transaction | VersionedTransaction>(): Promise<T> => {
    throw new Error("read-only");
  },
  signAllTransactions: async <T extends Transaction | VersionedTransaction>(): Promise<T[]> => {
    throw new Error("read-only");
  },
};

export function getProgram(connection: Connection, wallet?: AnchorWallet): Program {
  const provider = new AnchorProvider(connection, wallet ?? readOnlyWallet, { commitment: "confirmed" });
  return new Program(IDL, provider);
}

/* ---------- normalized view types (decoupled from IDL churn) ---------- */
export type RoundStatus = "open" | "revealing" | "solved" | "expired" | "cancelled" | "unknown";
export interface ParamsView {
  minRevealDelaySlots: number;
  revealWindowSlots: number;
  guessFeeSol: number;
  guessCooldownSlots: number;
  maxCommitsPerWallet: number;
  maxRoundDurationSecs: number;
  maxDistributionSol: number;
  maxClaimSol: number;
}
export interface ConfigView {
  owner: string;
  pendingOwner: string | null;
  operator: string | null;
  feeWallet: string | null;
  tokenMint: string;
  paused: boolean | null; // null = program build has no pause flag
  roundCount: number;
  distributionCount: number;
  roundActive: boolean;
  pendingPublishRound: number | null;
  params: ParamsView;
  excluded: string[];
}
export interface RoundView {
  id: number;
  address: string;
  answerCommitmentHex: string;
  unlockTs: number; // unix seconds
  deadlineTs: number;
  startedAt: number;
  status: RoundStatus;
  totalCommits: number;
  candidate: string | null;
  candidateCommitSlot: number;
  firstRevealSlot: number;
  revealWindowEndSlot: number;
  solver: string | null;
  solvedAt: number;
  solverPayoutSol: number;
  holderPayoutSol: number;
  /** Only populated by the program AFTER the answer became public (first valid reveal / publish_answer). */
  answerPublished: boolean;
  publishedAnswer: string | null;
  publishedSaltHex: string | null;
}
export interface GuessView {
  commitmentHex: string;
  commitSlot: number;
  attempts: number;
}

const num = (v: any) => (v == null ? 0 : BN.isBN(v) ? Number(v.toString()) : Number(v));
const pk = (v: any) => (v == null ? null : typeof v === "string" ? v : v.toBase58?.() ?? String(v));
const sol = (v: any) => num(v) / LAMPORTS_PER_SOL;
export const toHex = (b: ArrayLike<number>) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

function statusOf(s: any): RoundStatus {
  if (!s) return "unknown";
  const k = Object.keys(s)[0]?.toLowerCase() as RoundStatus;
  return ["open", "revealing", "solved", "expired", "cancelled"].includes(k) ? k : "unknown";
}

export async function isProgramDeployed(connection: Connection): Promise<boolean> {
  const info = await connection.getAccountInfo(PROGRAM_ID);
  return !!info?.executable;
}

export async function fetchConfig(program: Program): Promise<ConfigView | null> {
  const c: any = await (program.account as any).config.fetchNullable(pda.config());
  if (!c) return null;
  const p: any = c.params ?? c; // older drafts kept params flat on Config
  return {
    owner: pk(c.owner ?? c.admin)!,
    pendingOwner: pk(c.pendingOwner ?? c.pendingAdmin),
    operator: pk(c.operator ?? c.admin),
    feeWallet: pk(c.feeWallet),
    tokenMint: pk(c.tokenMint)!,
    paused: "paused" in c ? !!c.paused : null,
    roundCount: num(c.roundCount),
    distributionCount: num(c.distributionCount),
    roundActive: !!c.roundActive,
    pendingPublishRound: c.pendingPublishRound == null ? null : num(c.pendingPublishRound),
    params: {
      minRevealDelaySlots: num(p.minRevealDelaySlots),
      revealWindowSlots: num(p.revealWindowSlots),
      guessFeeSol: sol(p.guessFeeLamports),
      guessCooldownSlots: num(p.guessCooldownSlots),
      maxCommitsPerWallet: num(p.maxCommitsPerWallet),
      maxRoundDurationSecs: num(p.maxRoundDurationSecs),
      maxDistributionSol: sol(p.maxDistributionLamports),
      maxClaimSol: sol(p.maxClaimLamports),
    },
    excluded: Array.isArray(c.excluded) ? c.excluded.map(pk) : [],
  };
}

function roundView(address: PublicKey, r: any): RoundView {
  const published = !!r.answerPublished && r.revealedAnswer && r.revealedAnswer.length > 0;
  return {
    id: num(r.id),
    address: address.toBase58(),
    answerCommitmentHex: toHex(r.answerCommitment),
    unlockTs: num(r.unlockTs),
    deadlineTs: num(r.deadlineTs),
    startedAt: num(r.startedAt),
    status: statusOf(r.status),
    totalCommits: num(r.totalCommits),
    candidate: pk(r.candidate),
    candidateCommitSlot: num(r.candidateCommitSlot),
    firstRevealSlot: num(r.firstRevealSlot),
    revealWindowEndSlot: num(r.revealWindowEndSlot),
    solver: pk(r.solver),
    solvedAt: num(r.solvedAt),
    solverPayoutSol: sol(r.solverPayout),
    holderPayoutSol: sol(r.holderPayout),
    answerPublished: !!published,
    publishedAnswer: published ? new TextDecoder().decode(Uint8Array.from(r.revealedAnswer)) : null,
    publishedSaltHex: published && r.revealedSalt ? toHex(r.revealedSalt) : null,
  };
}

export async function fetchRound(program: Program, id: number): Promise<RoundView | null> {
  const address = pda.round(id);
  const r: any = await (program.account as any).round.fetchNullable(address);
  return r ? roundView(address, r) : null;
}

/** Fetch several rounds in one RPC call (newest first). */
export async function fetchRounds(program: Program, ids: number[]): Promise<RoundView[]> {
  if (!ids.length) return [];
  const addrs = ids.map((i) => pda.round(i));
  const rs: any[] = await (program.account as any).round.fetchMultiple(addrs);
  return rs.map((r, i) => (r ? roundView(addrs[i], r) : null)).filter((x): x is RoundView => !!x);
}

export async function fetchGuess(program: Program, roundId: number, solver: PublicKey): Promise<GuessView | null> {
  const g: any = await (program.account as any).guessCommitment.fetchNullable(pda.guess(pda.round(roundId), solver));
  if (!g) return null;
  return { commitmentHex: toHex(g.commitment), commitSlot: num(g.commitSlot), attempts: num(g.attempts) };
}

/** Spendable SOL in a program-owned PDA (balance minus its rent-exempt minimum). */
export async function spendableSol(connection: Connection, address: PublicKey): Promise<number | null> {
  const info = await connection.getAccountInfo(address);
  if (!info) return null;
  const rent = await connection.getMinimumBalanceForRentExemption(info.data.length);
  return Math.max(0, info.lamports - rent) / LAMPORTS_PER_SOL;
}

/* ---------- transactions ---------- */
export async function buildCommitGuessTx(program: Program, roundId: number, solver: PublicKey, commitment: Uint8Array) {
  const round = pda.round(roundId);
  return (program.methods as any)
    .commitGuess(Array.from(commitment))
    .accountsPartial({ config: pda.config(), round, guess: pda.guess(round, solver), vault: pda.vault(), solver })
    .transaction() as Promise<Transaction>;
}

export async function buildRevealTx(
  program: Program, roundId: number, solver: PublicKey, salt: Uint8Array, answer: Uint8Array, nonce: Uint8Array,
) {
  const round = pda.round(roundId);
  const { Buffer } = await import("buffer");
  return (program.methods as any)
    .reveal(Array.from(salt), Buffer.from(answer), Array.from(nonce))
    .accountsPartial({ config: pda.config(), round, guess: pda.guess(round, solver), solver })
    .transaction() as Promise<Transaction>;
}

/** Permissionless crank: settles a Revealing round after its window (pays the candidate). */
export async function buildFinalizeTx(program: Program, roundId: number, winner: PublicKey) {
  return (program.methods as any)
    .finalizeRound()
    .accountsPartial({ config: pda.config(), round: pda.round(roundId), vault: pda.vault(), holderPool: pda.holderPool(), winner })
    .transaction() as Promise<Transaction>;
}

type SendFn = (tx: Transaction, connection: Connection) => Promise<string>;

/** Send through the wallet adapter and confirm by polling (works through the HTTP-only RPC proxy). */
export async function sendAndConfirm(connection: Connection, send: SendFn, feePayer: PublicKey, tx: Transaction) {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  tx.feePayer = feePayer;
  tx.recentBlockhash = blockhash;
  const sim = await connection.simulateTransaction(tx);
  if (sim.value.err) throw new Error(`Simulation failed: ${JSON.stringify(sim.value.err)} ${(sim.value.logs ?? []).slice(-4).join(" | ")}`);
  const sig = await send(tx, connection);
  for (;;) {
    const { value } = await connection.getSignatureStatuses([sig]);
    const st = value[0];
    if (st?.err) throw new Error(`Transaction failed: ${JSON.stringify(st.err)}`);
    if (st && (st.confirmationStatus === "confirmed" || st.confirmationStatus === "finalized")) return sig;
    if ((await connection.getBlockHeight("confirmed")) > lastValidBlockHeight) throw new Error("Transaction expired; please retry.");
    await new Promise((r) => setTimeout(r, 1500));
  }
}
