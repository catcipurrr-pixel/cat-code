import type { Metadata, Viewport } from "next";
import { Share_Tech_Mono, Space_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import MatrixRain from "@/components/MatrixRain";
import "./globals.css";
import { asset } from "@/config";

const body = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-body" });
const display = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
  title: "CAT CODE // Terminal Session",
  description: "Hold. Decode. Claim the vault. Cipher only — never the key.",
  icons: { icon: asset("/logo.jpg") },
  openGraph: { title: "CAT CODE", description: "Hold. Decode. Claim the vault.", images: [asset("/logo.jpg")] },
};
export const viewport: Viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>
        <MatrixRain />
        <div className="scanlines" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
