"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { votingContract, Candidate, Voter } from '@/lib/blockchain/contract';
import { toast } from "sonner";

interface Web3ContextType {
  account: string | null;
  isAdmin: boolean;
  isConnected: boolean;
  isInitializing: boolean;
  connectWallet: () => Promise<boolean>;
  voterInfo: Voter | null;
  candidates: Candidate[];
  electionStarted: boolean;
  electionEnded: boolean;
  refreshCandidates: () => Promise<void>;
  refreshElectionStatus: () => Promise<void>;
  addCandidate: (name: string, description: string, imageHash: string) => Promise<boolean>;
  registerVoter: (address: string) => Promise<boolean>;
  batchRegisterVoters: (addresses: string[]) => Promise<boolean>;
  startElection: () => Promise<boolean>;
  endElection: () => Promise<boolean>;
  vote: (candidateName: string) => Promise<boolean>;
  getWinner: () => Promise<Candidate | null>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [voterInfo, setVoterInfo] = useState<Voter | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [electionStarted, setElectionStarted] = useState(false);
  const [electionEnded, setElectionEnded] = useState(false);
  // Remove unused adminAddress state

  // Memoize functions that interact with the blockchain to prevent infinite loops
  // Because votingContract is a stable import, we can use empty dependency arrays
  const refreshCandidates = useCallback(async () => {
    try {
      const candidatesList = await votingContract.getCandidates();
      setCandidates(candidatesList);
      // Remove the return statement to match Promise<void>
    } catch (error) {
      console.error("Error refreshing candidates:", error);
    }
  }, []);
  
  const refreshElectionStatus = useCallback(async () => {
    try {
      const startedStatus = await votingContract.isElectionStarted();
      const endedStatus = await votingContract.isElectionEnded();
      
      setElectionStarted(startedStatus);
      setElectionEnded(endedStatus);
    } catch (error) {
      console.error("Error refreshing election status:", error);
    }
  }, []);

  // Initialize the connection and load data - run only once at mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const success = await votingContract.initialize();
        
        if (success) {
          // Get current account
          const currentAccount = await votingContract.getCurrentAccount();
          if (currentAccount) {
            setAccount(currentAccount.toLowerCase());
            setIsConnected(true);
            
            // Check if the current account is the admin
            const admin = await votingContract.getAdmin();
            // Don't store admin address since we don't use it
            setIsAdmin(currentAccount.toLowerCase() === admin?.toLowerCase());
            
            // Get voter info
            const info = await votingContract.getVoterInfo(currentAccount);
            setVoterInfo(info);
            
            // Load candidates
            await refreshCandidates();
            
            // Check election status
            await refreshElectionStatus();
          }
        }
      } catch (error) {
        console.error("Failed to initialize Web3:", error);
        toast.error("Error", {
          description: "Failed to connect to blockchain. Is the node running?"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [refreshCandidates, refreshElectionStatus]); // Add stable callback dependencies

  const connectWallet = async (): Promise<boolean> => {
    try {
      // With JsonRpcProvider, we're already connected to the first account
      // Just reinitialize to get the current state
      return await votingContract.initialize();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Connection Error", {
        description: "Failed to connect to blockchain node"
      });
      return false;
    }
  };

  // Fix other functions to break circular dependencies
  const addCandidate = useCallback(async (name: string, description: string, imageHash: string) => {
    try {
      const success = await votingContract.addCandidate(name, description, imageHash);
      if (success) {
        toast.success("Success", {
          description: `Candidate ${name} added successfully`
        });
        // Call the function directly instead of depending on it
        await refreshCandidates();
      }
      return success;
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Error", {
        description: "Failed to add candidate"
      });
      return false;
    }
  }, [refreshCandidates]); // Add refreshCandidates as dependency
  
  const registerVoter = useCallback(async (address: string) => {
    try {
      const success = await votingContract.registerVoter(address);
      if (success) {
        toast.success("Success", {
          description: `Voter ${address} registered successfully`
        });
      }
      return success;
    } catch (error) {
      console.error("Error registering voter:", error);
      toast.error("Error", {
        description: "Failed to register voter"
      });
      return false;
    }
  }, []);
  
  const batchRegisterVoters = useCallback(async (addresses: string[]) => {
    try {
      const success = await votingContract.batchRegisterVoters(addresses);
      if (success) {
        toast.success("Success", {
          description: `${addresses.length} voters registered successfully`
        });
      }
      return success;
    } catch (error) {
      console.error("Error batch registering voters:", error);
      toast.error("Error", {
        description: "Failed to register voters"
      });
      return false;
    }
  }, []);
  
  const startElection = useCallback(async () => {
    try {
      const success = await votingContract.startElection();
      if (success) {
        setElectionStarted(true);
        toast.success("Success", {
          description: "Election started successfully"
        });
        await refreshElectionStatus();
      }
      return success;
    } catch (error) {
      console.error("Error starting election:", error);
      toast.error("Error", {
        description: "Failed to start election"
      });
      return false;
    }
  }, [refreshElectionStatus]); // Add refreshElectionStatus as dependency
  
  const endElection = useCallback(async () => {
    try {
      const success = await votingContract.endElection();
      if (success) {
        setElectionEnded(true);
        toast.success("Success", {
          description: "Election ended successfully"
        });
        await refreshElectionStatus();
      }
      return success;
    } catch (error) {
      console.error("Error ending election:", error);
      toast.error("Error", {
        description: "Failed to end election"
      });
      return false;
    }
  }, [refreshElectionStatus]); // Add refreshElectionStatus as dependency
  
  const vote = useCallback(async (candidateName: string) => {
    try {
      const success = await votingContract.vote(candidateName);
      if (success) {
        toast.success("Success", {
          description: `Vote for ${candidateName} recorded successfully`
        });
        
        // Update voter info
        if (account) {
          const info = await votingContract.getVoterInfo(account);
          setVoterInfo(info);
        }
        
        // Call the function directly instead of depending on it
        await refreshCandidates();
      }
      return success;
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Error", {
        description: "Failed to cast vote"
      });
      return false;
    }
  }, [account, refreshCandidates]); // Add refreshCandidates to the dependency array
  
  const getWinner = useCallback(async () => {
    try {
      return await votingContract.getWinner();
    } catch (error) {
      console.error("Error getting winner:", error);
      toast.error("Error", {
        description: "Failed to get winner"
      });
      return null;
    }
  }, []); // No dependencies required

  const value = {
    account,
    isAdmin,
    isConnected,
    isInitializing,
    connectWallet,
    voterInfo,
    candidates,
    electionStarted,
    electionEnded,
    refreshCandidates,
    refreshElectionStatus,
    addCandidate,
    registerVoter,
    batchRegisterVoters,
    startElection,
    endElection,
    vote,
    getWinner,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}