// Usage: npm run screenshots   (expects the app running on BASE_URL, default http://localhost:3000)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = new URL("../screenshots/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const shots = [
  { name: "desktop-1280", path: "/", viewport: { width: 1280, height: 800 }, full: false },
  { name: "desktop-1280-full", path: "/", viewport: { width: 1280, height: 800 }, full: true },
  { name: "mobile-390", path: "/", viewport: { width: 390, height: 844 }, full: false, mobile: true },
  { name: "mobile-390-full", path: "/", viewport: { width: 390, height: 844 }, full: true, mobile: true },
  { name: "admin-desktop-1280", path: "/admin", viewport: { width: 1280, height: 800 }, full: true },
  { name: "admin-mobile-390", path: "/admin", viewport: { width: 390, height: 844 }, full: true, mobile: true },
];
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: s.viewport, deviceScaleFactor: s.mobile ? 2 : 1, isMobile: !!s.mobile, hasTouch: !!s.mobile });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && console.log(`[${s.name}] console:`, m.text().slice(0, 200)));
  await page.goto(base + s.path, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500); // let matrix rain fill + RPC reads settle
  await page.screenshot({ path: `${out}${s.name}.png`, fullPage: s.full });
  console.log("saved", `${out}${s.name}.png`);
  await ctx.close();
}
await browser.close();
