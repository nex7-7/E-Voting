"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Candidate } from "@/lib/blockchain/contract";

export default function ResultsView() {
  const { electionStarted, electionEnded, candidates, getWinner, refreshCandidates } = useWeb3();
  const [winner, setWinner] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the loadResults function to prevent infinite re-rendering
  const loadResults = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshCandidates();
      if (electionEnded) {
        const winnerResult = await getWinner();
        setWinner(winnerResult);
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshCandidates, electionEnded, getWinner]);

  useEffect(() => {
    loadResults();
    // Add polling interval if needed
    const intervalId = setInterval(loadResults, 30000);
    return () => clearInterval(intervalId);
  }, [loadResults]);

  if (!electionStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Election Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-500">The election has not started yet.</p>
        </CardContent>
      </Card>
    );
  }

  if (!electionEnded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Election Results</CardTitle>
          <CardDescription>Current standings (election in progress)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-amber-500">
            Final results will be available after the election ends.
          </p>
          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              Loading current standings...
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.sort((a, b) => b.voteCount - a.voteCount).map((candidate) => (
                <div 
                  key={candidate.name} 
                  className="p-4 border rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-sm text-muted-foreground">{candidate.description}</div>
                  </div>
                  <div className="text-lg font-semibold">{candidate.voteCount} votes</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={loadResults} 
            variant="outline" 
            className="w-full"
            disabled={isLoading}
          >
            Refresh Standings
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Election Results</CardTitle>
        <CardDescription>The election has ended</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            Loading results...
          </div>
        ) : (
          <>
            {winner && (
              <div className="mb-6 p-4 border-2 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Winner: {winner.name}</h3>
                <p className="text-muted-foreground mb-2">{winner.description}</p>
                <p className="text-lg font-semibold">{winner.voteCount} votes</p>
              </div>
            )}
            
            <h3 className="text-lg font-medium mb-4">All Candidates</h3>
            <div className="space-y-4">
              {candidates.sort((a, b) => b.voteCount - a.voteCount).map((candidate) => (
                <div 
                  key={candidate.name} 
                  className={`p-4 border rounded-lg flex items-center justify-between ${
                    winner && candidate.name === winner.name ? "border-green-500" : ""
                  }`}
                >
                  <div>
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-sm text-muted-foreground">{candidate.description}</div>
                  </div>
                  <div className="text-lg font-semibold">{candidate.voteCount} votes</div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={loadResults} 
          variant="outline" 
          className="w-full"
          disabled={isLoading}
        >
          Refresh Results
        </Button>
      </CardFooter>
    </Card>
  );
}