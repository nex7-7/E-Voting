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

export class VotingContract {
  private contract: ethers.Contract | null = null;
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  
  // Contract address from deployment
  private contractAddress = networkConfig.contractAddress; // Replace with your deployed contract address
  
  async initialize() {
    try {
      // Connect to local Hardhat node
      this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      
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
      const count = await this.contract!.getCandidateCount();
      const candidates: Candidate[] = [];

      for (let i = 0; i < count; i++) {
        const [name, description, imageHash, voteCount] = await this.contract!.getCandidate(i);
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
      const tx = await this.contract!.registerVoter(address);
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
      const tx = await this.contract!.batchRegisterVoters(addresses);
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
      const [isRegistered, hasVoted, votedFor] = await this.contract!.voters(address);
      return { isRegistered, hasVoted, votedCandidateIndex: votedFor };
    } catch (error) {
      console.error("Error getting voter info:", error);
      return null;
    }
  }

  async startElection(): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      const tx = await this.contract!.startElection();
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

  async vote(candidateName: string): Promise<boolean> {
    try {
      if (!this.contract) await this.initialize();
      const tx = await this.contract!.vote(candidateName);
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
      const [name, description, imageHash, voteCount] = await this.contract!.getWinner();
      return {
        name,
        description,
        imageHash,
        voteCount: Number(voteCount)
      };
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