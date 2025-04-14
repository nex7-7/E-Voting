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
    
    event CandidateAdded(uint256 id, string name, string description, string ipfsImageHash);
    event VoteCast(address voter, uint256 candidateId);
    event VoterAdded(address voter);
    
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
    
    // Add a candidate with IPFS image hash
    function addCandidate(string memory _name, string memory _description, string memory _ipfsImageHash) public onlyAdmin {
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
        allowedVoters[_voter] = true;
        emit VoterAdded(_voter);
    }
    
    // Vote for a candidate
    function vote(uint256 _candidateId) public onlyAllowedVoter {
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
        for(uint i = 0; i < _voters.length; i++) {
            allowedVoters[_voters[i]] = true;
            emit VoterAdded(_voters[i]);
        }
    }
}
