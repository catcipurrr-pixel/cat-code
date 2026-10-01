import idl from "@/idl/cat_code.json";

/**
 * Central site configuration. Every value can be overridden with a NEXT_PUBLIC_* env var
 * (see .env.example). Nothing in here is secret, and no answers/salts/keys belong here.
 */
/* ======================================================================
 * COUNTDOWN TARGET: change this ONE line to move the game start
 * (ISO 8601 with offset/Z, or unix seconds). Env NEXT_PUBLIC_FALLBACK_COUNTDOWN_TARGET overrides it.
 * Used until an on-chain round exists; afterwards the round's unlock_ts is used.
 * ==================================================================== */
export const COUNTDOWN_TARGET = "2026-10-06T23:00:00Z"; // Tue Oct 6, 2026, 7:00 PM ET

/** Time zone + label used when displaying times on the site. */
export const DISPLAY_TZ = { timeZone: "America/Toronto", label: "ET" } as const;

/** Base path when served from a sub-path (GitHub Pages project site: "/cat-code"). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** Prefix a public/ asset path with the base path. */
export const asset = (p: string) => (/^https?:\/\//.test(p) ? p : `${BASE_PATH}${p}`);

/**
 * CORS-friendly public mainnet RPCs, tried in order (used by the static GitHub Pages build,
 * which has no server-side proxy). Override with NEXT_PUBLIC_RPC_URLS (comma-separated).
 */
export const PUBLIC_RPC_FALLBACKS = [
  "https://solana-rpc.publicnode.com",
  "https://solana.leorpc.com/?api_key=FREE",
  "https://api.mainnet-beta.solana.com",
];

const env = (k: string | undefined, d: string) => (k && k.trim() !== "" ? k.trim() : d);

function parseTarget(v: string): number {
  if (/^\d+$/.test(v)) return Number(v) * 1000;
  const t = Date.parse(v);
  return Number.isNaN(t) ? Date.parse(COUNTDOWN_TARGET) : t;
}

export const CONFIG = {
  /**
   * RPC for the Anchor program (reads + transactions). Default: the built-in server proxy
   * (/api/rpc/main -> RPC_UPSTREAM_URL). Set to a full https URL to call an RPC directly
   * (it must allow browser origins, e.g. a Helius key with a domain allowlist).
   */
  rpcUrl: env(process.env.NEXT_PUBLIC_RPC_URL, "/api/rpc/main"),
  cluster: env(process.env.NEXT_PUBLIC_CLUSTER, "mainnet-beta"),
  /** Program ID. Defaults to the IDL address (keep in sync after `anchor keys sync` + deploy). */
  programId: env(process.env.NEXT_PUBLIC_PROGRAM_ID, (idl as { address: string }).address),
  /** Countdown target (ms since epoch) used while no on-chain round exists. */
  fallbackCountdownTargetMs: parseTarget(
    env(process.env.NEXT_PUBLIC_FALLBACK_COUNTDOWN_TARGET, COUNTDOWN_TARGET),
  ),
  /** Cipher files are fetched only after unlock. {id} = round id. */
  cipherUrlTemplate: asset(env(process.env.NEXT_PUBLIC_CIPHER_URL_TEMPLATE, "/puzzles/round-{id}.json")),
  /** Published (post-round) answers live here; fetched at runtime. */
  pastRoundsUrl: asset("/rounds.json"),
  /** Poll interval for on-chain state. */
  pollMs: 15_000,

  token: {
    ca: "CbfSdYr4qc4YyzF3E22kiSAhoQfN61AvVkit82tKpump",
    pumpUrl: "https://pump.fun/coin/CbfSdYr4qc4YyzF3E22kiSAhoQfN61AvVkit82tKpump",
  },
  split: { solver: 70, holders: 20, nextRound: 10 },
} as const;

export function explorerUrl(kind: "address" | "tx", id: string, cluster: string = CONFIG.cluster) {
  const c = cluster === "mainnet-beta" ? "" : cluster === "localnet" ? "?cluster=custom" : `?cluster=${cluster}`;
  return `https://solscan.io/${kind === "tx" ? "tx" : "account"}/${id}${c}`;
}

/** Resolve a relative RPC path ("/api/rpc/main") to an absolute URL for web3.js. */
export function resolveRpc(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  return origin + BASE_PATH + url;
}

/** Static build: browser talks to public RPCs directly (no /api proxy exists on GitHub Pages). */
export const STATIC_BUILD = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const rpcEnvList = (process.env.NEXT_PUBLIC_RPC_URLS ?? "").split(",").map((x) => x.trim()).filter(Boolean);
export const RPC_LIST: string[] = rpcEnvList.length ? rpcEnvList : PUBLIC_RPC_FALLBACKS;

/**
 * fetch() for web3.js Connection that ignores the given URL and tries each RPC in RPC_LIST
 * until one answers without an HTTP/RPC-level access error. Remembers the last good endpoint.
 */
let goodIdx = 0;
export const fallbackFetch: typeof fetch = async (_url, init) => {
  let lastErr: unknown;
  for (let k = 0; k < RPC_LIST.length; k++) {
    const i = (goodIdx + k) % RPC_LIST.length;
    try {
      const res = await fetch(RPC_LIST[i], init);
      if (res.ok) { goodIdx = i; return res; }
      lastErr = new Error(`${RPC_LIST[i]} -> HTTP ${res.status}`);
    } catch (e) { lastErr = e; }
  }
  throw lastErr ?? new Error("all RPC endpoints failed");
};

/** Connection settings: proxy/direct URL in server mode, public RPC list with failover in static mode. */
export function connectionArgs(): { endpoint: string; fetch?: typeof fetch } {
  if (STATIC_BUILD && !process.env.NEXT_PUBLIC_RPC_URL) return { endpoint: RPC_LIST[0], fetch: fallbackFetch };
  return { endpoint: resolveRpc(CONFIG.rpcUrl) };
}

/** "Tue, Oct 6 · 7:00 PM ET" */
export function fmtOpens(ms: number): string {
  const d = new Date(ms);
  const day = d.toLocaleDateString("en-US", { timeZone: DISPLAY_TZ.timeZone, weekday: "short", month: "short", day: "numeric" });
  const t = d.toLocaleTimeString("en-US", { timeZone: DISPLAY_TZ.timeZone, hour: "numeric", minute: "2-digit" });
  return `${day} · ${t} ${DISPLAY_TZ.label}`;
}
/** "TUE" */
export const weekdayShort = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { timeZone: DISPLAY_TZ.timeZone, weekday: "short" }).toUpperCase();

/** "Oct 6, 2026, 7:00 PM ET" */
export function fmtTime(ms: number): string {
  return `${new Date(ms).toLocaleString("en-US", { timeZone: DISPLAY_TZ.timeZone, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })} ${DISPLAY_TZ.label}`;
}
