"use client";
import dynamic from "next/dynamic";
// Wallet button touches window; render it client-side only to avoid hydration mismatches.
export const WalletButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false, loading: () => <button className="wallet-adapter-button wallet-adapter-button-trigger">Select Wallet</button> },
);
