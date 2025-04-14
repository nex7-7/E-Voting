import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
        Decentralized Voting Platform
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground mb-8">
        A secure and transparent way to conduct elections using blockchain technology.
        Connect your wallet to get started.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/vote">Cast Your Vote</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/results">View Results</Link>
        </Button>
      </div>
    </div>
  );
}
