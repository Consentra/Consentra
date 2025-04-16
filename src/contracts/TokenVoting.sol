
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TokenVoting
 * @dev Contract for token-weighted voting mechanism
 * Compatible with Hedera and other EVM-based chains
 */
contract TokenVoting is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    IERC20 public governanceToken;
    
    struct TokenVote {
        uint256 weight;
        string choice;
        bool hasVoted;
        bool tokensLocked;
        uint256 unlockTime;
    }
    
    // ProposalId => User => Vote details
    mapping(uint256 => mapping(address => TokenVote)) public votes;
    
    // ProposalId => Option => Vote weight
    mapping(uint256 => mapping(string => uint256)) public weightedVoteCounts;
    
    // ProposalId => Total votes weight
    mapping(uint256 => uint256) public totalVoteWeights;
    
    // ProposalId => Lock duration in seconds
    mapping(uint256 => uint256) public voteLockDurations;
    
    // ProposalId => Voting snapshot time
    mapping(uint256 => uint256) public voteSnapshots;
    
    event TokenVoteCast(
        uint256 indexed proposalId, 
        address indexed voter, 
        uint256 weight, 
        string choice
    );
    
    event TokensLocked(
        address indexed user, 
        uint256 indexed proposalId, 
        uint256 amount, 
        uint256 unlockTime
    );
    
    event TokensUnlocked(
        address indexed user, 
        uint256 indexed proposalId, 
        uint256 amount
    );
    
    /**
     * @dev Constructor to initialize the token voting contract
     * @param _governanceToken Address of the governance token
     */
    constructor(address _governanceToken) {
        require(_governanceToken != address(0), "Invalid token address");
        
        governanceToken = IERC20(_governanceToken);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(GOVERNANCE_ROLE, msg.sender);
    }
    
    /**
     * @dev Set up a new proposal for token voting
     * @param proposalId Proposal ID
     * @param lockDuration How long tokens remain locked after voting (in seconds)
     * @param useSnapshot Whether to use token balances at the current time as snapshot
     * @return The snapshot timestamp if enabled
     */
    function setupVoting(
        uint256 proposalId, 
        uint256 lockDuration,
        bool useSnapshot
    ) external returns (uint256) {
        require(hasRole(GOVERNANCE_ROLE, msg.sender), "Must have governance role");
        require(voteSnapshots[proposalId] == 0, "Already set up");
        
        voteLockDurations[proposalId] = lockDuration;
        
        if (useSnapshot) {
            voteSnapshots[proposalId] = block.timestamp;
        }
        
        return voteSnapshots[proposalId];
    }
    
    /**
     * @dev Vote with tokens on a proposal
     * @param proposalId Proposal ID
     * @param choice Option to vote for
     * @param amount Amount of tokens to vote with
     */
    function voteWithTokens(
        uint256 proposalId,
        string memory choice,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(votes[proposalId][msg.sender].hasVoted == false, "Already voted");
        require(governanceToken.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        
        // If using a snapshot, check if proposal is set up
        if (voteSnapshots[proposalId] > 0) {
            // In a real implementation, this would check the token balance at the snapshot time
            // For this contract, we're using the current balance for simplicity
        }
        
        // Lock tokens by transferring them to this contract
        require(governanceToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        uint256 unlockTime = 0;
        if (voteLockDurations[proposalId] > 0) {
            unlockTime = block.timestamp + voteLockDurations[proposalId];
        }
        
        // Record the vote
        votes[proposalId][msg.sender] = TokenVote({
            weight: amount,
            choice: choice,
            hasVoted: true,
            tokensLocked: true,
            unlockTime: unlockTime
        });
        
        // Update vote counts
        weightedVoteCounts[proposalId][choice] += amount;
        totalVoteWeights[proposalId] += amount;
        
        emit TokenVoteCast(proposalId, msg.sender, amount, choice);
        emit TokensLocked(msg.sender, proposalId, amount, unlockTime);
    }
    
    /**
     * @dev Unlock tokens after lock period ends
     * @param proposalId Proposal ID
     */
    function unlockTokens(uint256 proposalId) external nonReentrant {
        TokenVote storage vote = votes[proposalId][msg.sender];
        
        require(vote.hasVoted, "No vote found");
        require(vote.tokensLocked, "Tokens already unlocked");
        require(block.timestamp >= vote.unlockTime, "Tokens still locked");
        
        uint256 amount = vote.weight;
        vote.tokensLocked = false;
        
        // Return tokens to the voter
        require(governanceToken.transfer(msg.sender, amount), "Token transfer failed");
        
        emit TokensUnlocked(msg.sender, proposalId, amount);
    }
    
    /**
     * @dev Get vote result for a proposal
     * @param proposalId Proposal ID
     * @param options Array of voting options
     * @return weights Array of vote weights for each option
     * @return totalWeight Total vote weight
     */
    function getVoteResults(uint256 proposalId, string[] memory options) 
        external 
        view 
        returns (uint256[] memory weights, uint256 totalWeight) 
    {
        weights = new uint256[](options.length);
        
        for (uint256 i = 0; i < options.length; i++) {
            weights[i] = weightedVoteCounts[proposalId][options[i]];
        }
        
        return (weights, totalVoteWeights[proposalId]);
    }
    
    /**
     * @dev Get voter information for a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return weight Vote weight
     * @return choice Selected option
     * @return hasVoted Whether user has voted
     * @return tokensLocked Whether tokens are still locked
     * @return unlockTime When tokens can be unlocked
     */
    function getVoterInfo(uint256 proposalId, address voter) 
        external 
        view 
        returns (
            uint256 weight,
            string memory choice,
            bool hasVoted,
            bool tokensLocked,
            uint256 unlockTime
        ) 
    {
        TokenVote memory vote = votes[proposalId][voter];
        
        return (
            vote.weight,
            vote.choice,
            vote.hasVoted,
            vote.tokensLocked,
            vote.unlockTime
        );
    }
    
    /**
     * @dev Change the governance token address
     * @param newToken New token address
     */
    function setGovernanceToken(address newToken) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        require(newToken != address(0), "Invalid token address");
        
        governanceToken = IERC20(newToken);
    }
    
    /**
     * @dev Emergency function to unlock all tokens if needed
     * @param proposalId Proposal ID
     * @param voter Voter address
     */
    function emergencyUnlock(uint256 proposalId, address voter) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must have admin role");
        
        TokenVote storage vote = votes[proposalId][voter];
        
        require(vote.hasVoted && vote.tokensLocked, "No locked tokens");
        
        uint256 amount = vote.weight;
        vote.tokensLocked = false;
        
        require(governanceToken.transfer(voter, amount), "Token transfer failed");
        
        emit TokensUnlocked(voter, proposalId, amount);
    }
}
