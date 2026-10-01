// Serves ./out under /cat-code (like GitHub Pages) at http://localhost:3200/cat-code/
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
const root = resolve(new URL("../out", import.meta.url).pathname);
const base = process.env.BASE_PATH ?? "/cat-code";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain", ".ico": "image/x-icon" };
http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!p.startsWith(base)) { res.writeHead(404); return res.end("not found"); }
  p = join(root, p.slice(base.length));
  try { if ((await stat(p)).isDirectory()) p = join(p, "index.html"); } catch {}
  try { const b = await readFile(p); res.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404); res.end("not found"); }
}).listen(3200, () => console.log(`http://localhost:3200${base}/`));
