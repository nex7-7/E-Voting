import { ethers } from 'ethers';
import { networkConfig } from './config';
import VotingABI from './VotingABI.json';

// Contract interfaces
export interface Candidate {
  name: string;
  description: string;
  imageHash: string;
  voteCount: number;
}

export interface Voter {
  isRegistered: boolean;
  hasVoted: boolean;
  votedCandidateIndex: number;
}

export interface ElectionStatus {
  started: boolean;
  ended: boolean;
  voterListCID: string;
  candidatesCount: number;
}

export class VotingContract {
  private contract: ethers.Contract | null = null;
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  
  // Contract address from deployment
  private contractAddress = networkConfig.contractAddress; 
  
  async initialize() {
    try {
      // Connect to local Hardhat node
      this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      
      // Get the first account as signer (this is typically the deployer/admin in Hardhat)
      const accounts = await this.provider.listAccounts();
      if (accounts.length > 0) {
        this.signer = accounts[0];
        
        // Create contract instance
        this.contract = new ethers.Contract(
          this.contractAddress,
          VotingABI,
          this.signer
        );
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to initialize contract:", error);
      return false;
    }
  }

  async getAdmin(): Promise<string | null> {
    try {
      if (!this.contract) await this.initialize();
      return await this.contract!.admin();
    } catch (error) {
      console.error("Error getting admin:", error);
      return null;
    }
  }

  async getElectionStatus(): Promise<ElectionStatus> {
    try {
      if (!this.contract) await this.initialize();
      const [started, ended, voterListCID, candidatesCount] = await this.contract!.getElectionStatus();
      return { 
        started, 
        ended, 
        voterListCID, 
        candidatesCount: Number(candidatesCount) 
      };
    } catch (error) {
      console.error("Error getting election status:", error);
      return { 
        started: false, 
        ended: false, 
        voterListCID: '', 
        candidatesCount: 0 
      };
    }
  }

  async isElectionStarted(): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      return await this.contract!.electionStarted();
    } catch (error) {
      console.error("Error checking if election started:", error);
      return false;
    }
  }

  async isElectionEnded(): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      return await this.contract!.electionEnded();
    } catch (error) {
      console.error("Error checking if election ended:", error);
      return false;
    }
  }

  async getVoterListCID(): Promise<string> {
    try {
      if (!this.contract) await this.initialize();
      return await this.contract!.voterListCID();
    } catch (error) {
      console.error("Error getting voter list CID:", error);
      return '';
    }
  }

  async addCandidate(name: string, description: string, imageHash: string): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      const tx = await this.contract!.addCandidate(name, description, imageHash);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error adding candidate:", error);
      return false;
    }
  }

  async getCandidates(): Promise<Candidate[]> {
    try {
      if (!this.contract) await this.initialize();
      const count = Number(await this.contract!.candidatesCount());
      const candidates: Candidate[] = [];

      for (let i = 1; i <= count; i++) {
        const [id, name, description, imageHash, voteCount] = await this.contract!.getCandidate(i);
        candidates.push({
          name,
          description,
          imageHash,
          voteCount: Number(voteCount)
        });
      }

      return candidates;
    } catch (error) {
      console.error("Error getting candidates:", error);
      return [];
    }
  }

  async registerVoter(address: string): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      const tx = await this.contract!.addVoter(address);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error registering voter:", error);
      return false;
    }
  }

  async batchRegisterVoters(addresses: string[]): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      const tx = await this.contract!.addMultipleVoters(addresses);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error batch registering voters:", error);
      return false;
    }
  }

  async getVoterInfo(address: string): Promise<Voter | null> {
    try {
      if (!this.contract) await this.initialize();
      const isRegistered = await this.contract!.allowedVoters(address);
      const hasVoted = await this.contract!.voters(address);
      
      return { 
        isRegistered, 
        hasVoted, 
        votedCandidateIndex: 0 // We don't track which candidate was voted for in this contract
      };
    } catch (error) {
      console.error("Error getting voter info:", error);
      return null;
    }
  }

  async getAllVoters(): Promise<string[]> {
    try {
      if (!this.contract) await this.initialize();
      
      // Since the contract doesn't directly expose the list of all voters,
      // we need to get this from events
      const filter = this.contract!.filters.VoterAdded();
      const events = await this.contract!.queryFilter(filter);
      
      // Extract voter addresses from events
      return events
        .map(event => {
          // Type guard to check if this is an EventLog with args property
          if ('args' in event) {
            const args = event.args;
            // Handle args as any to avoid TypeScript errors with property access
            // The VoterAdded event in the contract emits the voter address as the first argument
            if (Array.isArray(args)) {
              return args[0]?.toString() || '';
            } else if (args) {
              // Cast to any to avoid TypeScript property access restrictions
              const argsAny = args as { voter?: string; _voter?: string };
              return (argsAny.voter || argsAny._voter || '')?.toString();
            }
          }
          
          // For regular Log objects without args, try to parse the data
          try {
            const decoded = this.contract!.interface.parseLog({
              topics: event.topics,
              data: event.data
            });
            if (decoded && decoded.args) {
              return decoded.args[0]?.toString() || '';
            }
          } catch (e) {
            console.error("Failed to decode log:", e);
          }
          return '';
        })
        .filter(address => !!address); // Filter out empty addresses
    } catch (error) {
      console.error("Error getting all voters:", error);
      return [];
    }
  }

  async startElection(voterListCID: string): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      const tx = await this.contract!.startElection(voterListCID);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error starting election:", error);
      return false;
    }
  }

  async endElection(): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      const tx = await this.contract!.endElection();
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error ending election:", error);
      return false;
    }
  }

  async vote(candidateId: string): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      const tx = await this.contract!.vote(candidateId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error voting:", error);
      return false;
    }
  }

  async getWinner(): Promise<Candidate | null> {
    try {
      if (!this.contract) await this.initialize();
      
      // Find the candidate with the most votes
      const candidates = await this.getCandidates();
      if (candidates.length === 0) return null;
      
      return candidates.reduce((max, current) => 
        current.voteCount > max.voteCount ? current : max, candidates[0]);
    } catch (error) {
      console.error("Error getting winner:", error);
      return null;
    }
  }

  async getCurrentAccount(): Promise<string | null> {
    try {
      if (!this.provider) await this.initialize();
      const accounts = await this.provider!.listAccounts();
      return accounts[0]?.address || null;
    } catch (error) {
      console.error("Error getting current account:", error);
      return null;
    }
  }
}

export const votingContract = new VotingContract();