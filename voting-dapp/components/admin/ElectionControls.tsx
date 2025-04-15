"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadFileToIPFS, getIPFSUrl } from "@/services/ipfsService";

export default function ElectionControls() {
  const { startElection, endElection, electionStarted, electionEnded, getAllVoters, voterListCID } = useWeb3();
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isGeneratingVoterList, setIsGeneratingVoterList] = useState(false);
  const [voterCount, setVoterCount] = useState(0);

  const fetchVoterCount = async () => {
    const voters = await getAllVoters();
    setVoterCount(voters.length);
  };

  useEffect(() => {
    if (!electionStarted) {
      fetchVoterCount();
    }

    // Set up an interval to periodically refresh the voter count
    const intervalId = setInterval(() => {
      if (!electionStarted) {
        fetchVoterCount();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [electionStarted, getAllVoters]);

  const generateAndUploadVoterList = async () => {
    setIsGeneratingVoterList(true);
    try {
      // Get all registered voters
      const voters = await getAllVoters();
      
      if (voters.length === 0) {
        toast.error("No voters registered", {
          description: "You need to register voters before starting the election"
        });
        return null;
      }
      
      // Create a voter list with timestamp and metadata
      const voterList = {
        timestamp: new Date().toISOString(),
        electionName: "Blockchain Voting Election",
        totalVoters: voters.length,
        voters: voters.map(address => ({ 
          address,
          registered: true
        }))
      };
      
      // Convert to JSON and create a blob
      const voterListBlob = new Blob([JSON.stringify(voterList, null, 2)], {
        type: "application/json"
      });
      
      // Create a File object for IPFS
      const voterListFile = new File([voterListBlob], "voter-list.json", {
        type: "application/json"
      });
      
      toast.info("Uploading voter list to IPFS...");
      
      // Upload to IPFS
      const cid = await uploadFileToIPFS(voterListFile);
      
      toast.success("Voter list uploaded to IPFS", {
        description: `CID: ${cid}`,
      });
      
      return cid;
    } catch (error) {
      console.error("Error generating voter list:", error);
      toast.error("Failed to generate voter list");
      return null;
    } finally {
      setIsGeneratingVoterList(false);
    }
  };

  const handleStartElection = async () => {
    if (isStarting) return;
    
    setIsStarting(true);
    try {
      // Generate and upload voter list to IPFS
      const voterListCID = await generateAndUploadVoterList();
      
      if (!voterListCID) {
        setIsStarting(false);
        return;
      }
      
      // Start the election with the voter list CID
      const success = await startElection(voterListCID);
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

  const handleViewVoterList = () => {
    if (!voterListCID) return;
    
    window.open(getIPFSUrl(voterListCID), '_blank');
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
              {voterCount > 0 && (
                <p className="mt-2 font-semibold">
                  {voterCount} voters registered
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {voterListCID && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleViewVoterList}
            >
              <Download className="h-4 w-4" />
              View Voter List
            </Button>
            <p className="text-xs mt-2 text-gray-500">
              IPFS CID: {voterListCID}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handleStartElection} 
          disabled={isStarting || electionStarted || electionEnded || isGeneratingVoterList || voterCount === 0}
        >
          {isStarting || isGeneratingVoterList ? "Starting..." : "Start Election"}
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