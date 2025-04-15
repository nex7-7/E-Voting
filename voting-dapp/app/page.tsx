import { Button } from "@/components/ui/button";
import Link from "next/link";
import ConnectionSettings from "@/components/blockchain/ConnectionSettings";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
        Decentralized Voting Platform
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground mb-8">
        A secure and transparent way to conduct elections using blockchain technology.
        Connect to a blockchain node to get started.
      </p>
      
      <div className="w-full mb-8">
        <ConnectionSettings />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/vote">Cast Your Vote</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/results">View Results</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin">Admin Panel</Link>
        </Button>
      </div>
    </div>
  );
}
