const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // Deploy the contract
    voting = await Voting.deploy();
    await voting.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await voting.admin()).to.equal(owner.address);
    });

    it("Should start with election not started", async function () {
      expect(await voting.electionStarted()).to.equal(false);
    });

    it("Should start with election not ended", async function () {
      expect(await voting.electionEnded()).to.equal(false);
    });
  });

  describe("Candidate Management", function () {
    it("Should allow admin to add a candidate", async function () {
      await expect(
        voting.addCandidate("Candidate1", "Description1", "hash1")
      )
        .to.emit(voting, "CandidateAdded")
        .withArgs("Candidate1");
      
      expect(await voting.getCandidateCount()).to.equal(1);
      
      const candidate = await voting.getCandidate(0);
      expect(candidate.name).to.equal("Candidate1");
      expect(candidate.description).to.equal("Description1");
      expect(candidate.imageHash).to.equal("hash1");
      expect(candidate.voteCount).to.equal(0);
    });

    it("Should not allow non-admin to add a candidate", async function () {
      await expect(
        voting.connect(addr1).addCandidate("Candidate1", "Description1", "hash1")
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not allow adding a candidate with the same name", async function () {
      await voting.addCandidate("Candidate1", "Description1", "hash1");
      await expect(
        voting.addCandidate("Candidate1", "Description2", "hash2")
      ).to.be.revertedWith("Candidate already exists");
    });
  });

  describe("Voter Registration", function () {
    it("Should allow admin to register a voter", async function () {
      await expect(
        voting.registerVoter(addr1.address)
      )
        .to.emit(voting, "VoterRegistered")
        .withArgs(addr1.address);
      
      const voter = await voting.voters(addr1.address);
      expect(voter.isRegistered).to.equal(true);
      expect(voter.hasVoted).to.equal(false);
    });

    it("Should allow admin to batch register voters", async function () {
      await voting.batchRegisterVoters([addr1.address, addr2.address]);
      
      const voter1 = await voting.voters(addr1.address);
      expect(voter1.isRegistered).to.equal(true);
      
      const voter2 = await voting.voters(addr2.address);
      expect(voter2.isRegistered).to.equal(true);
    });
  });

  describe("Election Management", function () {
    beforeEach(async function () {
      // Add a candidate
      await voting.addCandidate("Candidate1", "Description1", "hash1");
    });

    it("Should allow admin to start an election", async function () {
      await expect(voting.startElection())
        .to.emit(voting, "ElectionStarted");
      
      expect(await voting.electionStarted()).to.equal(true);
    });

    it("Should not start an election without candidates", async function () {
      // Deploy a new contract without candidates
      const emptyVoting = await Voting.deploy();
      await emptyVoting.deployed();
      
      await expect(emptyVoting.startElection())
        .to.be.revertedWith("No candidates added");
    });

    it("Should allow admin to end an election", async function () {
      await voting.startElection();
      
      await expect(voting.endElection())
        .to.emit(voting, "ElectionEnded");
      
      expect(await voting.electionEnded()).to.equal(true);
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      // Add candidates
      await voting.addCandidate("Candidate1", "Description1", "hash1");
      await voting.addCandidate("Candidate2", "Description2", "hash2");
      
      // Register voters
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      
      // Start election
      await voting.startElection();
    });

    it("Should allow registered voter to vote", async function () {
      await expect(
        voting.connect(addr1).vote("Candidate1")
      )
        .to.emit(voting, "Voted")
        .withArgs(addr1.address, "Candidate1");
      
      expect(await voting.getVotes("Candidate1")).to.equal(1);
      
      const voter = await voting.voters(addr1.address);
      expect(voter.hasVoted).to.equal(true);
      expect(voter.votedFor).to.equal("Candidate1");
    });

    it("Should not allow unregistered voter to vote", async function () {
      await expect(
        voting.connect(addrs[0]).vote("Candidate1")
      ).to.be.revertedWith("Voter not registered");
    });

    it("Should not allow voting twice", async function () {
      await voting.connect(addr1).vote("Candidate1");
      
      await expect(
        voting.connect(addr1).vote("Candidate2")
      ).to.be.revertedWith("Already voted");
    });

    it("Should not allow voting for non-existent candidate", async function () {
      await expect(
        voting.connect(addr1).vote("NonExistentCandidate")
      ).to.be.revertedWith("Candidate does not exist");
    });

    it("Should not allow voting after election has ended", async function () {
      await voting.endElection();
      
      await expect(
        voting.connect(addr1).vote("Candidate1")
      ).to.be.revertedWith("Election has ended");
    });
  });

  describe("Results", function () {
    beforeEach(async function () {
      // Add candidates
      await voting.addCandidate("Candidate1", "Description1", "hash1");
      await voting.addCandidate("Candidate2", "Description2", "hash2");
      
      // Register voters
      await voting.registerVoter(addr1.address);
      await voting.registerVoter(addr2.address);
      await voting.registerVoter(addrs[0].address);
      
      // Start election
      await voting.startElection();
      
      // Cast votes
      await voting.connect(addr1).vote("Candidate1");
      await voting.connect(addr2).vote("Candidate2");
      await voting.connect(addrs[0]).vote("Candidate1");
      
      // End election
      await voting.endElection();
    });

    it("Should correctly determine the winner", async function () {
      const winner = await voting.getWinner();
      expect(winner.name).to.equal("Candidate1");
      expect(winner.voteCount).to.equal(2);
    });

    it("Should not allow getting the winner before election has ended", async function () {
      // Deploy a new contract for this test
      const newVoting = await Voting.deploy();
      await newVoting.deployed();
      
      await newVoting.addCandidate("Candidate1", "Description1", "hash1");
      await newVoting.startElection();
      
      await expect(
        newVoting.getWinner()
      ).to.be.revertedWith("Election not ended yet");
    });
  });
});
