import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal JSON-RPC proxy so browsers never hit a rate-limited/origin-blocked public RPC directly
 * and so a paid RPC key (RPC_UPSTREAM_URL) stays server-side. Only the methods this site needs
 * are allowed. Upstreams:
 *   /api/rpc/main      -> RPC_UPSTREAM_URL           (program reads + transactions)
 */
const UPSTREAMS: Record<string, string | undefined> = {
  main: process.env.RPC_UPSTREAM_URL || "https://api.mainnet-beta.solana.com",
};
const ALLOWED = new Set([
  "getAccountInfo", "getMultipleAccounts", "getBalance", "getSlot", "getBlockHeight", "getEpochInfo",
  "getMinimumBalanceForRentExemption", "getLatestBlockhash", "isBlockhashValid", "getFeeForMessage",
  "getSignatureStatuses", "getTransaction", "sendTransaction", "simulateTransaction", "getGenesisHash", "getVersion",
  "getRecentPrioritizationFees",
]);

export async function POST(req: NextRequest, ctx: { params: Promise<{ target: string }> }) {
  const { target } = await ctx.params;
  const upstream = UPSTREAMS[target];
  if (!upstream) return NextResponse.json({ error: "unknown target" }, { status: 404 });
  const text = await req.text();
  if (text.length > 64_000) return NextResponse.json({ error: "too large" }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const calls = Array.isArray(body) ? body : [body];
  if (calls.length > 10 || calls.some((c) => !c || typeof c !== "object" || !ALLOWED.has((c as { method?: string }).method ?? "")))
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32601, message: "method not allowed" } }, { status: 403 });
  const r = await fetch(upstream, { method: "POST", headers: { "content-type": "application/json" }, body: text, cache: "no-store" });
  return new NextResponse(await r.text(), { status: r.status, headers: { "content-type": "application/json" } });
}
