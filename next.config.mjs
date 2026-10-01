/**
 * Two build modes:
 *  - default (`npm run build`): Node server (Vercel etc.) with the /api/rpc proxy.
 *  - static (`npm run build:static`, STATIC_EXPORT=1): `output: "export"` for GitHub Pages.
 *    The /api route (route.proxy.ts) is excluded and the browser calls public RPCs directly.
 *    BASE_PATH defaults to "/cat-code" (project page https://<user>.github.io/cat-code/).
 */
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = isStatic ? (process.env.BASE_PATH ?? "/cat-code") : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isStatic
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath ? `${basePath}/` : undefined,
        trailingSlash: true,
        images: { unoptimized: true },
        pageExtensions: ["tsx", "ts"],
      }
    : { pageExtensions: ["tsx", "ts", "proxy.ts"] }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC_EXPORT: isStatic ? "1" : "0",
  },
  webpack: (config) => {
    // wallet-adapter / web3.js pull in optional node-only deps; ignore them in the browser bundle
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, os: false, path: false, crypto: false };
    config.externals = [...(config.externals || []), "pino-pretty", "lokijs", "encoding"];
    return config;
  },
};
export default nextConfig;
