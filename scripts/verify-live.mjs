// Usage: node scripts/verify-live.mjs <url> [screenshot.png]
// Loads the page in headless Chrome and checks matrix canvas, logo, vault balance, countdown, CA copy.
import { chromium } from "playwright";
const [, , url = "http://localhost:3200/cat-code/", shot] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
const rpcHosts = new Set();
page.on("request", (r) => r.method() === "POST" && rpcHosts.add(new URL(r.url()).host));
await page.goto(url, { waitUntil: "networkidle" });
const vault = page.locator(".stat .big-value").first();
await page.waitForFunction(() => /\d+\.\d{4} SOL/.test(document.querySelector(".stat .big-value")?.textContent ?? ""), null, { timeout: 30000 }).catch(() => {});
const r = {
  vault: await vault.textContent(),
  vaultSub: await page.locator(".stat .panel-sub").first().textContent(),
  countdown1: await page.locator(".countdown").textContent(),
  unlocks: await page.locator(".stat .panel-sub").nth(1).textContent(),
  logoLoaded: await page.locator(".logo-box img").evaluate((i) => i.complete && i.naturalWidth > 0),
  canvasPainted: await page.locator("canvas.matrix").evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let g = 0;
    for (let i = 0; i < d.length; i += 4 * 97) if (d[i + 1] > 60) g++; return g;
  }),
};
await page.waitForTimeout(2000);
r.countdown2 = await page.locator(".countdown").textContent();
await page.getByRole("button", { name: "Copy CA" }).click();
r.copyLabel = await page.getByRole("button", { name: "Copy CA" }).textContent();
r.clipboard = await page.evaluate(() => navigator.clipboard.readText()).catch((e) => "ERR " + e);
r.rpcHosts = [...rpcHosts];
r.consoleErrors = errors;
if (shot) { await page.waitForTimeout(1500); await page.screenshot({ path: shot }); r.screenshot = shot; }
const adm = await ctx.newPage();
await adm.goto(new URL("admin/", url).href, { waitUntil: "networkidle" });
await adm.waitForTimeout(4000);
r.admin = await adm.locator(".kv").evaluateAll((els) => els.slice(0, 6).map((e) => e.textContent.replace(/\s+/g, " ").trim()));
console.log(JSON.stringify(r, null, 2));
await browser.close();
