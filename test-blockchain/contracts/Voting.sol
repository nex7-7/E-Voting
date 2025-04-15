// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        string description;
        string ipfsImageHash; // IPFS CID for candidate image
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;
    mapping(address => bool) public voters;
    mapping(address => bool) public allowedVoters;
    address public admin;
    
    // Election status
    bool public electionStarted;
    bool public electionEnded;
    
    // IPFS hash for voter list
    string public voterListCID;
    
    event CandidateAdded(uint256 id, string name, string description, string ipfsImageHash);
    event VoteCast(address voter, uint256 candidateId);
    event VoterAdded(address voter);
    event ElectionStarted(string voterListCID);
    event ElectionEnded();
    
    constructor() {
        admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyAllowedVoter() {
        require(allowedVoters[msg.sender], "You are not allowed to vote");
        _;
    }
    
    modifier electionActive() {
        require(electionStarted, "Election has not started yet");
        require(!electionEnded, "Election has already ended");
        _;
    }
    
    // Add a candidate with IPFS image hash
    function addCandidate(string memory _name, string memory _description, string memory _ipfsImageHash) public onlyAdmin {
        require(!electionStarted, "Cannot add candidates after election has started");
        
        candidatesCount++;
        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            _description,
            _ipfsImageHash,
            0
        );
        
        emit CandidateAdded(candidatesCount, _name, _description, _ipfsImageHash);
    }
    
    // Add voters to the allowed list
    function addVoter(address _voter) public onlyAdmin {
        require(!electionStarted, "Cannot add voters after election has started");
        allowedVoters[_voter] = true;
        emit VoterAdded(_voter);
    }
    
    // Start the election and store voter list on IPFS
    function startElection(string memory _voterListCID) public onlyAdmin {
        require(!electionStarted, "Election has already started");
        require(candidatesCount > 0, "No candidates added yet");
        require(bytes(_voterListCID).length > 0, "Voter list CID is required");
        
        electionStarted = true;
        voterListCID = _voterListCID;
        
        emit ElectionStarted(_voterListCID);
    }
    
    // End the election
    function endElection() public onlyAdmin electionActive {
        electionEnded = true;
        emit ElectionEnded();
    }
    
    // Vote for a candidate
    function vote(uint256 _candidateId) public onlyAllowedVoter electionActive {
        require(!voters[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        
        emit VoteCast(msg.sender, _candidateId);
    }
    
    // Get candidate details with IPFS hash
    function getCandidate(uint256 _candidateId) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        string memory ipfsImageHash,
        uint256 voteCount
    ) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.description, c.ipfsImageHash, c.voteCount);
    }
    
    // Add multiple voters at once
    function addMultipleVoters(address[] memory _voters) public onlyAdmin {
        require(!electionStarted, "Cannot add voters after election has started");
        for(uint i = 0; i < _voters.length; i++) {
            allowedVoters[_voters[i]] = true;
            emit VoterAdded(_voters[i]);
        }
    }
    
    // Get election status
    function getElectionStatus() public view returns (
        bool started,
        bool ended,
        string memory _voterListCID,
        uint256 _candidatesCount
    ) {
        return (electionStarted, electionEnded, voterListCID, candidatesCount);
    }
}
