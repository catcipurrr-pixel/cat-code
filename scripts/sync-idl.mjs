// Copies the Anchor IDL + TS types from the program workspace (read-only) into src/idl.
// Run `npm run sync-idl` whenever the program is rebuilt. The committed copy in src/idl
// is what Vercel builds use, so the site builds without the program folder present.
import { existsSync, copyFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const programDir = resolve(process.env.CAT_CODE_PROGRAM_DIR ?? resolve(here, "../../cat-code-program"));
const pairs = [
  ["target/idl/cat_code.json", "src/idl/cat_code.json"],
  ["target/types/cat_code.ts", "src/idl/cat_code_types.ts"],
];
for (const [from, to] of pairs) {
  const src = resolve(programDir, from);
  if (!existsSync(src)) { console.warn(`[sync-idl] missing ${src}, keeping existing copy`); continue; }
  copyFileSync(src, resolve(here, "..", to));
  console.log(`[sync-idl] ${src} -> ${to}`);
}
const idl = JSON.parse(readFileSync(resolve(here, "../src/idl/cat_code.json"), "utf8"));
console.log(`[sync-idl] IDL address ${idl.address}, ${idl.instructions.length} instructions`);
