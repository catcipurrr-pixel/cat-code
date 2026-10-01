/**
 * Client-side hashing helpers that mirror the on-chain program:
 *   round commitment  = sha256(salt || answer)
 *   guess commitment  = sha256(salt || answer || solver_pubkey || nonce)
 * The player's guess never leaves the browser except inside their own `reveal` transaction.
 */
export async function sha256(...parts: Uint8Array[]): Promise<Uint8Array> {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const buf = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { buf.set(p, o); o += p.length; }
  return new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
}

/**
 * Mirrors the program's `canonicalize`: printable ASCII only, ASCII-lowercase, trim,
 * collapse runs of space/tab/CR/LF into one space, 1..=256 bytes. Throws on invalid input.
 */
export function canonicalize(raw: string): Uint8Array {
  const bytes = new TextEncoder().encode(raw);
  if (bytes.length > 512) throw new Error("Answer too long.");
  const out: number[] = [];
  let pendingSpace = false;
  for (const b of bytes) {
    if (b === 0x20 || b === 0x09 || b === 0x0a || b === 0x0d) {
      if (out.length) pendingSpace = true;
    } else if (b >= 0x21 && b <= 0x7e) {
      if (pendingSpace) { out.push(0x20); pendingSpace = false; }
      out.push(b >= 0x41 && b <= 0x5a ? b + 32 : b);
    } else {
      throw new Error("Answers must be plain ASCII (no accents/emoji).");
    }
  }
  if (out.length === 0 || out.length > 256) throw new Error("Answer must be 1–256 characters.");
  return Uint8Array.from(out);
}

/** Display form of the canonical answer. */
export const normalizeAnswer = (s: string) => new TextDecoder().decode(canonicalize(s));

/**
 * The 32-byte round salt. The puzzle hides it either as a phrase (operator tooling derives
 * sha256("catcode-salt-v1:" || canonicalize(phrase))) or directly as 64 hex chars.
 */
export async function saltFromInput(input: string): Promise<Uint8Array> {
  const t = input.trim();
  const hex = /^(0x)?[0-9a-fA-F]{64}$/.test(t) ? hexToBytes(t) : null;
  if (hex) return hex;
  return sha256(new TextEncoder().encode("catcode-salt-v1:"), canonicalize(t));
}

export function hexToBytes(hex: string): Uint8Array | null {
  const h = hex.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]*$/.test(h) || h.length % 2) return null;
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}
