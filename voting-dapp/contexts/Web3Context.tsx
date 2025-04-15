"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { votingContract, Candidate, Voter } from '@/lib/blockchain/contract';
import { toast } from "sonner";
import { networkConfig } from '@/lib/blockchain/config';

interface Web3ContextType {
  account: string | null;
  isAdmin: boolean;
  isConnected: boolean;
  isInitializing: boolean;
  currentRpcUrl: string | null;
  connectWallet: () => Promise<boolean>;
  connectToNode: (rpcUrl: string) => Promise<boolean>;
  voterInfo: Voter | null;
  candidates: Candidate[];
  electionStarted: boolean;
  electionEnded: boolean;
  voterListCID: string | null;
  refreshCandidates: () => Promise<void>;
  refreshElectionStatus: () => Promise<void>;
  addCandidate: (name: string, description: string, imageHash: string) => Promise<boolean>;
  registerVoter: (address: string) => Promise<boolean>;
  batchRegisterVoters: (addresses: string[]) => Promise<boolean>;
  startElection: (voterListCID: string) => Promise<boolean>;
  endElection: () => Promise<boolean>;
  vote: (candidateName: string) => Promise<boolean>;
  getWinner: () => Promise<Candidate | null>;
  getAllVoters: () => Promise<string[]>;
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
  const [voterListCID, setVoterListCID] = useState<string | null>(null);
  const [currentRpcUrl, setCurrentRpcUrl] = useState<string | null>(null);

  const refreshCandidates = useCallback(async () => {
    try {
      const candidatesList = await votingContract.getCandidates();
      setCandidates(candidatesList);
    } catch (error) {
      console.error("Error refreshing candidates:", error);
    }
  }, []);
  
  const refreshElectionStatus = useCallback(async () => {
    try {
      const { started, ended, voterListCID: cid } = await votingContract.getElectionStatus();
      
      setElectionStarted(started);
      setElectionEnded(ended);
      setVoterListCID(cid || null);
    } catch (error) {
      console.error("Error refreshing election status:", error);
    }
  }, []);

  useEffect(() => {
    const savedRpcUrl = localStorage.getItem('lastConnectedNode');
    if (savedRpcUrl) {
      connectToNode(savedRpcUrl).catch(console.error);
    } else {
      initialize();
    }
  }, []);

  const initialize = async () => {
    setIsInitializing(true);
    try {
      const success = await votingContract.initialize();
      
      if (success) {
        setCurrentRpcUrl(networkConfig.rpcUrl);
        const currentAccount = await votingContract.getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount.toLowerCase());
          setIsConnected(true);
          
          const admin = await votingContract.getAdmin();
          setIsAdmin(currentAccount.toLowerCase() === admin?.toLowerCase());
          
          const info = await votingContract.getVoterInfo(currentAccount);
          setVoterInfo(info);
          
          await refreshCandidates();
          await refreshElectionStatus();
        }
      }
    } catch (error) {
      console.error("Failed to initialize Web3:", error);
      toast.error("Error", {
        description: "Failed to connect to blockchain. Is the node running?"
      });
      setIsConnected(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const connectToNode = async (rpcUrl: string): Promise<boolean> => {
    setIsInitializing(true);
    try {
      const success = await votingContract.connectToRpcUrl(rpcUrl);
      
      if (success) {
        setCurrentRpcUrl(rpcUrl);
        localStorage.setItem('lastConnectedNode', rpcUrl);
        
        const currentAccount = await votingContract.getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount.toLowerCase());
          setIsConnected(true);
          
          const admin = await votingContract.getAdmin();
          setIsAdmin(currentAccount.toLowerCase() === admin?.toLowerCase());
          
          const info = await votingContract.getVoterInfo(currentAccount);
          setVoterInfo(info);
          
          await refreshCandidates();
          await refreshElectionStatus();
          
          toast.success("Connected", {
            description: `Successfully connected to ${rpcUrl}`
          });
          return true;
        }
      }
      
      toast.error("Connection failed", {
        description: "Could not connect to the specified blockchain node"
      });
      return false;
    } catch (error) {
      console.error("Error connecting to node:", error);
      toast.error("Connection error", {
        description: `Failed to connect to ${rpcUrl}`
      });
      setIsConnected(false);
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  const connectWallet = async (): Promise<boolean> => {
    try {
      return await votingContract.initialize();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Connection Error", {
        description: "Failed to connect to blockchain node"
      });
      return false;
    }
  };

  const getAllVoters = useCallback(async () => {
    try {
      return await votingContract.getAllVoters();
    } catch (error) {
      console.error("Error getting all voters:", error);
      return [];
    }
  }, []);

  const addCandidate = useCallback(async (name: string, description: string, imageHash: string) => {
    try {
      const success = await votingContract.addCandidate(name, description, imageHash);
      if (success) {
        toast.success("Success", {
          description: `Candidate ${name} added successfully`
        });
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
  }, [refreshCandidates]);
  
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
  
  const startElection = useCallback(async (voterListCID: string) => {
    try {
      const success = await votingContract.startElection(voterListCID);
      if (success) {
        setElectionStarted(true);
        setVoterListCID(voterListCID);
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
  }, [refreshElectionStatus]);
  
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
  }, [refreshElectionStatus]);
  
  const vote = useCallback(async (candidateName: string) => {
    try {
      const success = await votingContract.vote(candidateName);
      if (success) {
        toast.success("Success", {
          description: `Vote for ${candidateName} recorded successfully`
        });
        
        if (account) {
          const info = await votingContract.getVoterInfo(account);
          setVoterInfo(info);
        }
        
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
  }, [account, refreshCandidates]);
  
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
  }, []);

  const value = {
    account,
    isAdmin,
    isConnected,
    isInitializing,
    currentRpcUrl,
    connectWallet,
    connectToNode,
    voterInfo,
    candidates,
    electionStarted,
    electionEnded,
    voterListCID,
    refreshCandidates,
    refreshElectionStatus,
    addCandidate,
    registerVoter,
    batchRegisterVoters,
    startElection,
    endElection,
    vote,
    getWinner,
    getAllVoters,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}