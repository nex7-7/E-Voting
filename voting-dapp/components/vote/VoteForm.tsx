"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { Candidate } from "@/lib/blockchain/contract";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function VoteForm() {
  const { 
    isConnected, 
    candidates, 
    electionStarted, 
    electionEnded,
    voterInfo,
    vote 
  } = useWeb3();
  
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [isVoting, setIsVoting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCandidate) {
      toast.error("Error", {
        description: "Please select a candidate"
      });
      return;
    }
    
    setIsVoting(true);
    try {
      await vote(selectedCandidate);
    } finally {
      setIsVoting(false);
    }
  };

  // Not connected to wallet
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote</CardTitle>
          <CardDescription>Cast your vote for a candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-amber-500">
            Please connect your wallet to vote.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Election not started
  if (!electionStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote</CardTitle>
          <CardDescription>Cast your vote for a candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-amber-500">
            The election has not started yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Election ended
  if (electionEnded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote</CardTitle>
          <CardDescription>Cast your vote for a candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-amber-500">
            The election has ended.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Voter not registered
  if (!voterInfo?.isRegistered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote</CardTitle>
          <CardDescription>Cast your vote for a candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Your address is not registered to vote.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Already voted
  if (voterInfo?.hasVoted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vote</CardTitle>
          <CardDescription>Cast your vote for a candidate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-green-500">
            You have already voted for {voterInfo.votedFor}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Vote</CardTitle>
          <CardDescription>Cast your vote for a candidate</CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p>No candidates available.</p>
          ) : (
            <RadioGroup
              value={selectedCandidate}
              onValueChange={setSelectedCandidate}
              className="space-y-4"
            >
              {candidates.map((candidate: Candidate) => (
                <div
                  key={candidate.name}
                  className="flex items-center space-x-2 border p-4 rounded-md"
                >
                  <RadioGroupItem value={candidate.name} id={candidate.name} />
                  <Label htmlFor={candidate.name} className="flex flex-col cursor-pointer flex-1">
                    <span className="font-medium">{candidate.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {candidate.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!selectedCandidate || isVoting}
            className="w-full"
          >
            {isVoting ? "Voting..." : "Submit Vote"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}