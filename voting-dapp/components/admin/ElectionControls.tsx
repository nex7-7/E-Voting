"use client";

import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ElectionControls() {
  const { startElection, endElection, electionStarted, electionEnded } = useWeb3();
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const handleStartElection = async () => {
    if (isStarting) return;
    
    setIsStarting(true);
    try {
      const success = await startElection();
      if (success) {
        toast.success("Election started successfully");
      }
    } catch (error) {
      console.error("Error starting election:", error);
      toast.error("Error", {
        description: "Failed to start the election",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndElection = async () => {
    if (isEnding) return;
    
    setIsEnding(true);
    try {
      const success = await endElection();
      if (success) {
        toast.success("Election ended successfully");
      }
    } catch (error) {
      console.error("Error ending election:", error);
      toast.error("Error", {
        description: "Failed to end the election",
      });
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Election Controls</CardTitle>
        <CardDescription>Manage the state of the election</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {electionEnded ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This election has ended. Results are now available.
            </AlertDescription>
          </Alert>
        ) : electionStarted ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This election is currently active. Registered voters can cast their votes.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This election has not yet started. Register candidates and voters before starting.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handleStartElection} 
          disabled={isStarting || electionStarted || electionEnded}
        >
          {isStarting ? "Starting..." : "Start Election"}
        </Button>
        <Button 
          onClick={handleEndElection} 
          disabled={isEnding || !electionStarted || electionEnded}
          variant="destructive"
        >
          {isEnding ? "Ending..." : "End Election"}
        </Button>
      </CardFooter>
    </Card>
  );
}