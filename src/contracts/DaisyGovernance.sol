
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DaisyGovernance
 * @dev Core governance contract for proposals and voting
 * Compatible with Hedera and other EVM-based chains
 */
contract DaisyGovernance is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    Counters.Counter private _proposalIdCounter;
    
    enum ProposalState { Active, Succeeded, Defeated, Executed, Canceled }
    enum VoteType { Standard, TokenWeighted, Quadratic }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool canceled;
        VoteType voteType;
        string[] options;
        mapping(string => uint256) optionVotes;  // Option => Vote count
        mapping(address => bool) hasVoted;       // Voter => Has voted
        mapping(address => string) voterChoices; // Voter => Selected option
        mapping(address => uint256) voteWeights; // Voter => Vote weight
        uint256 totalVotes;
        uint256 quorum;
        string metadataURI;
    }
    
    // Proposal ID => Proposal details
    mapping(uint256 => Proposal) public proposals;
    
    // Default governance parameters
    uint256 public votingPeriod;  // in seconds
    uint256 public quorumPercentage;  // e.g., 40 means 40%
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime,
        string[] options,
        VoteType voteType
    );
    
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        string choice,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId, address executor);
    event ProposalCanceled(uint256 indexed proposalId, address canceler);
    
    modifier onlyProposalExists(uint256 proposalId) {
        require(proposalId < _proposalIdCounter.current(), "Proposal does not exist");
        _;
    }

    /**
     * @dev Constructor to initialize the governance contract
     * @param admin Admin address with full privileges
     * @param _votingPeriod Default voting period in seconds
     * @param _quorumPercentage Default quorum percentage required
     */
    constructor(address admin, uint256 _votingPeriod, uint256 _quorumPercentage) {
        require(_quorumPercentage <= 100, "Quorum percentage must be <= 100");
        
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(ADMIN_ROLE, admin);
        _setupRole(PROPOSER_ROLE, admin);
        _setupRole(VOTER_ROLE, admin);
        _setupRole(EXECUTOR_ROLE, admin);
        
        votingPeriod = _votingPeriod;
        quorumPercentage = _quorumPercentage;
    }
    
    /**
     * @dev Creates a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param options Voting options
     * @param voteType Type of voting mechanism
     * @param duration Voting duration in seconds (0 for default)
     * @param metadataURI Additional metadata URI (e.g., IPFS hash)
     * @return proposalId ID of the created proposal
     */
    function createProposal(
        string memory title,
        string memory description,
        string[] memory options,
        VoteType voteType,
        uint256 duration,
        string memory metadataURI
    ) external returns (uint256) {
        require(hasRole(PROPOSER_ROLE, msg.sender), "Must have proposer role");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(options.length >= 2, "Need at least two options");
        
        uint256 proposalId = _proposalIdCounter.current();
        _proposalIdCounter.increment();
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + (duration > 0 ? duration : votingPeriod);
        proposal.voteType = voteType;
        proposal.options = options;
        proposal.quorum = quorumPercentage;
        proposal.metadataURI = metadataURI;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            proposal.startTime,
            proposal.endTime,
            options,
            voteType
        );
        
        return proposalId;
    }
    
    /**
     * @dev Cast a standard vote (1 person, 1 vote)
     * @param proposalId Proposal ID
     * @param option Option to vote for
     */
    function vote(uint256 proposalId, string memory option) external nonReentrant onlyProposalExists(proposalId) {
        require(hasRole(VOTER_ROLE, msg.sender), "Must have voter role");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed && !proposal.canceled, "Proposal already executed or canceled");
        require(_optionExists(proposal, option), "Option does not exist");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voterChoices[msg.sender] = option;
        
        uint256 weight = 1; // Standard vote weight
        
        if (proposal.voteType == VoteType.TokenWeighted || proposal.voteType == VoteType.Quadratic) {
            revert("Use voteWithTokens or voteQuadratic for this proposal");
        }
        
        proposal.voteWeights[msg.sender] = weight;
        proposal.optionVotes[option] += weight;
        proposal.totalVotes += weight;
        
        emit Voted(proposalId, msg.sender, option, weight);
    }
    
    /**
     * @dev Cast a token-weighted vote (voting power proportional to tokens)
     * @param proposalId Proposal ID
     * @param option Option to vote for
     * @param tokenAmount Amount of tokens to vote with
     */
    function voteWithTokens(
        uint256 proposalId, 
        string memory option, 
        uint256 tokenAmount
    ) external nonReentrant onlyProposalExists(proposalId) {
        require(hasRole(VOTER_ROLE, msg.sender), "Must have voter role");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.voteType == VoteType.TokenWeighted, "Not a token-weighted vote");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed && !proposal.canceled, "Proposal already executed or canceled");
        require(_optionExists(proposal, option), "Option does not exist");
        
        // In a real implementation, this would verify token ownership or transfer tokens
        // For this contract, we're trusting the input value
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voterChoices[msg.sender] = option;
        proposal.voteWeights[msg.sender] = tokenAmount;
        proposal.optionVotes[option] += tokenAmount;
        proposal.totalVotes += tokenAmount;
        
        emit Voted(proposalId, msg.sender, option, tokenAmount);
    }
    
    /**
     * @dev Cast a quadratic vote (voting power proportional to square root of tokens)
     * @param proposalId Proposal ID
     * @param option Option to vote for
     * @param tokenAmount Amount of tokens to vote with
     */
    function voteQuadratic(
        uint256 proposalId, 
        string memory option, 
        uint256 tokenAmount
    ) external nonReentrant onlyProposalExists(proposalId) {
        require(hasRole(VOTER_ROLE, msg.sender), "Must have voter role");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.voteType == VoteType.Quadratic, "Not a quadratic vote");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed && !proposal.canceled, "Proposal already executed or canceled");
        require(_optionExists(proposal, option), "Option does not exist");
        
        // Calculate quadratic voting weight (square root of token amount)
        uint256 weight = _sqrt(tokenAmount);
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voterChoices[msg.sender] = option;
        proposal.voteWeights[msg.sender] = weight;
        proposal.optionVotes[option] += weight;
        proposal.totalVotes += weight;
        
        emit Voted(proposalId, msg.sender, option, weight);
    }
    
    /**
     * @dev Execute a proposal after voting period ends
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external nonReentrant onlyProposalExists(proposalId) {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "Must have executor role");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        
        // Check if quorum is met
        uint256 minVotesRequired = (100 * proposal.totalVotes) / proposal.quorum;
        require(proposal.totalVotes >= minVotesRequired, "Quorum not reached");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId, msg.sender);
    }
    
    /**
     * @dev Cancel a proposal
     * @param proposalId Proposal ID
     */
    function cancelProposal(uint256 proposalId) external onlyProposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.proposer == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Only proposer or admin can cancel"
        );
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId, msg.sender);
    }
    
    /**
     * @dev Get the state of a proposal
     * @param proposalId Proposal ID
     * @return Current state of the proposal
     */
    function getProposalState(uint256 proposalId) external view onlyProposalExists(proposalId) returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.Canceled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }
        
        // Check if quorum is met
        uint256 minVotesRequired = (100 * proposal.totalVotes) / proposal.quorum;
        if (proposal.totalVotes >= minVotesRequired) {
            return ProposalState.Succeeded;
        } else {
            return ProposalState.Defeated;
        }
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId Proposal ID
     * @return Basic proposal information
     */
    function getProposalDetails(uint256 proposalId) 
        external 
        view 
        onlyProposalExists(proposalId)
        returns (
            uint256 id,
            address proposer,
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool executed,
            bool canceled,
            uint256 totalVotes,
            string memory metadataURI,
            VoteType voteType
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.canceled,
            proposal.totalVotes,
            proposal.metadataURI,
            proposal.voteType
        );
    }
    
    /**
     * @dev Get voting options for a proposal
     * @param proposalId Proposal ID
     * @return Array of options and their vote counts
     */
    function getProposalOptions(uint256 proposalId)
        external
        view
        onlyProposalExists(proposalId)
        returns (string[] memory options, uint256[] memory voteCounts)
    {
        Proposal storage proposal = proposals[proposalId];
        options = proposal.options;
        voteCounts = new uint256[](options.length);
        
        for (uint256 i = 0; i < options.length; i++) {
            voteCounts[i] = proposal.optionVotes[options[i]];
        }
        
        return (options, voteCounts);
    }
    
    /**
     * @dev Check if a voter has voted on a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return hasVoted Whether the voter has voted
     * @return choice The option they voted for (empty if they haven't voted)
     * @return weight The weight of their vote
     */
    function getVoterInfo(uint256 proposalId, address voter)
        external
        view
        onlyProposalExists(proposalId)
        returns (bool hasVoted, string memory choice, uint256 weight)
    {
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.hasVoted[voter],
            proposal.voterChoices[voter],
            proposal.voteWeights[voter]
        );
    }
    
    /**
     * @dev Update governance parameters
     * @param newVotingPeriod New default voting period in seconds
     * @param newQuorumPercentage New default quorum percentage
     */
    function updateGovernanceParams(uint256 newVotingPeriod, uint256 newQuorumPercentage) 
        external 
    {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        require(newQuorumPercentage <= 100, "Quorum percentage must be <= 100");
        
        votingPeriod = newVotingPeriod;
        quorumPercentage = newQuorumPercentage;
    }
    
    /**
     * @dev Grant voter role to an address
     * @param account Address to grant the role to
     */
    function grantVoterRole(address account) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        grantRole(VOTER_ROLE, account);
    }
    
    /**
     * @dev Grant proposer role to an address
     * @param account Address to grant the role to
     */
    function grantProposerRole(address account) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        grantRole(PROPOSER_ROLE, account);
    }
    
    /**
     * @dev Revoke voter role from an address
     * @param account Address to revoke the role from
     */
    function revokeVoterRole(address account) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        revokeRole(VOTER_ROLE, account);
    }
    
    /**
     * @dev Revoke proposer role from an address
     * @param account Address to revoke the role from
     */
    function revokeProposerRole(address account) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        revokeRole(PROPOSER_ROLE, account);
    }
    
    /**
     * @dev Check if an option exists in a proposal
     * @param proposal Proposal struct
     * @param option Option to check
     * @return Whether the option exists
     */
    function _optionExists(Proposal storage proposal, string memory option) private view returns (bool) {
        for (uint256 i = 0; i < proposal.options.length; i++) {
            if (keccak256(bytes(proposal.options[i])) == keccak256(bytes(option))) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Calculate square root of a number for quadratic voting
     * @param x Number to find square root of
     * @return y Square root of x
     */
    function _sqrt(uint256 x) private pure returns (uint256) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }
}
