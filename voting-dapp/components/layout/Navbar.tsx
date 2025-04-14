import Link from "next/link";
import ConnectWalletButton from "@/components/blockchain/ConnectWalletButton";

export default function Navbar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            E-Voting DApp
          </Link>
          <nav className="flex gap-4">
            <Link href="/vote" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Vote
            </Link>
            <Link href="/results" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Results
            </Link>
            <Link href="/admin" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Admin
            </Link>
          </nav>
        </div>
        
        <ConnectWalletButton />
      </div>
    </div>
  );
}