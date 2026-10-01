import Link from "next/link";
import Image from "next/image";
import { WalletButton } from "./WalletButton";
import { asset } from "@/config";

export default function Header({ admin = false }: { admin?: boolean }) {
  return (
    <header className="header">
      <Link href="/" className="brand" aria-label="Cat Code home">
        <div className="logo-box">
          <Image src={asset("/logo.jpg")} unoptimized alt="Cat Code skull logo" width={512} height={288} priority />
        </div>
        <div className="brand-text">
          <div className="kicker">{admin ? "// OPERATOR STATUS (READ-ONLY)" : "// TERMINAL SESSION"}</div>
          <h1 className="title">CAT CODE</h1>
          <p className="tagline">Hold. Decode. Claim the vault. Cipher only — never the key.</p>
        </div>
      </Link>
      <div className="actions">
        <WalletButton />
        <Link href={admin ? "/" : "/admin"} className="btn-outline">{admin ? "GAME" : "ADMIN"}</Link>
      </div>
    </header>
  );
}
