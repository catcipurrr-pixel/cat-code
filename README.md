# Cat Code: website

Next.js 15 (App Router) + TypeScript + Solana wallet-adapter (Phantom, Solflare) + Anchor client, all driven by the program IDL.

## Run locally
```bash
npm install
npm run sync-idl     # optional: copy the latest IDL/types from ../cat-code-program/target (read-only)
npm run dev          # http://localhost:3000
# or a production build:
npm run build && npm start
npm run screenshots  # Playwright + system Chrome -> screenshots/ (expects the app on :3000)
```

## Countdown target
Edit the single line `export const COUNTDOWN_TARGET = "..."` in `src/config.ts`. It's currently `2026-10-06T23:00:00Z`, which displays as "unlocks Oct 6, 2026, 7:00 PM ET". This target is used until an on-chain round exists. After that, the round's `unlock_ts` is used.

## GitHub Pages (static build)
`npm run build:static` sets `STATIC_EXPORT=1` and runs `output: "export"` into `out/`, with basePath `/cat-code`. GitHub Pages can't run a server, so this build leaves out the `/api/rpc` proxy. Instead the browser calls CORS-friendly public RPCs directly, with failover (`PUBLIC_RPC_FALLBACKS` in `src/config.ts`, or override with `NEXT_PUBLIC_RPC_URLS`). Preview locally with `npm run preview:static`, which serves http://localhost:3200/cat-code/. `.github/workflows/pages.yml` builds and deploys on every push to `main`. Run `node scripts/verify-live.mjs <url> [shot.png]` to smoke-test a deployment.

## Configuration
Everything lives in `src/config.ts`. Each value can be overridden with env vars (see `.env.example`):

| var | purpose |
|---|---|
| `RPC_UPSTREAM_URL` (server) | RPC behind the built-in `/api/rpc/main` proxy. Use a paid RPC in production. The key stays on the server. |
| `RPC_FALLBACK_UPSTREAM_URL` (server) | mainnet RPC used for the fee wallet's balance while the program isn't live |
| `NEXT_PUBLIC_RPC_URL` | Lets the browser call an RPC directly instead of the proxy. The RPC must allow browser origins. |
| `NEXT_PUBLIC_CLUSTER` | `mainnet-beta` / `devnet` / `localnet` (sets the explorer links) |
| `NEXT_PUBLIC_PROGRAM_ID` | deployed program ID (defaults to the IDL address) |
| `NEXT_PUBLIC_FALLBACK_COUNTDOWN_TARGET` | countdown target until an on-chain round exists (ISO date or unix seconds) |
| `NEXT_PUBLIC_CIPHER_URL_TEMPLATE` | where the cipher for round `{id}` is fetched from, **only after unlock** |

The public `api.mainnet-beta.solana.com` endpoint returns 403 to browser origins, which is why the site proxies RPC calls through `/api/rpc/*`. The proxy only allows the methods the site needs.

## Data flow
* **Program live and initialized:** the site reads Config, the latest Round, and the Vault/HolderPool PDAs through the Anchor IDL. The vault panel shows the vault's spendable SOL. The countdown targets the round's `unlock_ts`.
* **Not deployed yet (fallback):** the vault panel shows the fee wallet's SOL balance, and the countdown uses `NEXT_PUBLIC_FALLBACK_COUNTDOWN_TARGET`.
* **Playing:**
  1. Commit: the guess is checked locally against the public fingerprint, then `sha256(salt‖answer‖wallet‖nonce)` is sent. The nonce is stored in this browser's localStorage.
  2. Reveal: available once `min_reveal_delay_slots` have passed.
  3. Finalize: a permissionless button that appears after the earliest-commit-wins window closes.
* **Past rounds:** the answer and salt are shown only after the program records them on-chain (first valid reveal, or `publish_answer`), or from `public/rounds.json`. Each one can be checked against the round's fingerprint.
* **/admin:** read-only status only: config, owner/operator, paused, params, round, balances. It has no forms and never handles answers, salts or keys.

## Cipher publishing
The cipher is **not** in the bundle. At unlock time, upload `round-<id>.json` (`{ "title", "cipher", "hint" }`) to the URL in `NEXT_PUBLIC_CIPHER_URL_TEMPLATE`. The default is `public/puzzles/`, which requires a redeploy at unlock. An external bucket or CMS avoids that. Never deploy a cipher file early, and never put the answer in it.

## Deploy (Vercel)
1. Push this folder to a Git repo and import it in Vercel. Framework: Next.js. The default build command is `next build`.
2. Set env vars: `RPC_UPSTREAM_URL` (Helius/Triton/QuickNode), `RPC_FALLBACK_UPSTREAM_URL`, `NEXT_PUBLIC_CLUSTER`, `NEXT_PUBLIC_PROGRAM_ID`, `NEXT_PUBLIC_FALLBACK_COUNTDOWN_TARGET`, and `NEXT_PUBLIC_SITE_URL`.
3. After each program change, run `npm run sync-idl` and commit `src/idl/*`. Vercel builds from the committed copy.
