
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ProposalManager is AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256[] options;
        ProposalStatus status;
        bytes32 organizationId;
    }
    
    enum ProposalStatus { Active, Executed, Cancelled }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(uint256 => uint256)) public voteCounts;
    
    uint256 public proposalCount;
    
    event ProposalCreated(uint256 indexed proposalId, string title, address creator);
    event Voted(uint256 indexed proposalId, address voter, uint256 option);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PROPOSER_ROLE, msg.sender);
    }
    
    function createProposal(
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256[] memory options,
        bytes32 organizationId
    ) external returns (uint256) {
        require(hasRole(PROPOSER_ROLE, msg.sender), "Must have proposer role");
        require(startTime >= block.timestamp, "Start time must be in future");
        require(endTime > startTime, "End time must be after start time");
        
        uint256 proposalId = ++proposalCount;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            creator: msg.sender,
            startTime: startTime,
            endTime: endTime,
            options: options,
            status: ProposalStatus.Active,
            organizationId: organizationId
        });
        
        emit ProposalCreated(proposalId, title, msg.sender);
        return proposalId;
    }
    
    function vote(uint256 proposalId, uint256 option) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        hasVoted[proposalId][msg.sender] = true;
        voteCounts[proposalId][option]++;
        
        emit Voted(proposalId, msg.sender, option);
    }
}
