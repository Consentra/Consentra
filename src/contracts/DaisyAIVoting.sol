
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DaisyAIVoting
 * @dev Contract for AI-assisted voting and delegate voting
 * Compatible with Hedera and other EVM-based chains
 */
contract DaisyAIVoting is AccessControl, ReentrancyGuard {
    bytes32 public constant AI_ADMIN_ROLE = keccak256("AI_ADMIN_ROLE");
    bytes32 public constant AI_VOTER_ROLE = keccak256("AI_VOTER_ROLE");
    
    struct AIVote {
        uint256 proposalId;
        string choice;
        string reason;
        uint256 confidence;
        uint256 timestamp;
    }
    
    struct AIAgent {
        bool isAuthorized;
        uint256 totalVotes;
        uint256 successfulVotes;
        string metadataURI;
        uint256 lastUpdated;
    }
    
    struct UserAgentSettings {
        bool isEnabled;
        bool autoVoteEnabled;
        uint256 confidenceThreshold; // Minimum AI confidence to auto-vote (1-100)
        string[] keywords;
        string[] categories;
        uint256 lastUpdated;
    }
    
    // ProposalId => AI Vote
    mapping(uint256 => AIVote) public aiVotes;
    
    // AI Agent address => Agent settings
    mapping(address => AIAgent) public aiAgents;
    
    // User address => Agent settings
    mapping(address => UserAgentSettings) public userSettings;
    
    // User address => ProposalId => Delegate address (who user has delegated this proposal to)
    mapping(address => mapping(uint256 => address)) public voteDelegations;
    
    // ProposalId => total delegated votes count
    mapping(uint256 => uint256) public delegatedVotesCount;
    
    event AIVoteRegistered(
        uint256 indexed proposalId,
        address indexed agent,
        string choice,
        string reason,
        uint256 confidence,
        uint256 timestamp
    );
    
    event AIAgentAuthorized(address indexed agent, bool authorized);
    
    event UserAgentSettingsUpdated(
        address indexed user,
        bool isEnabled,
        bool autoVoteEnabled,
        uint256 confidenceThreshold
    );
    
    event VoteDelegated(
        address indexed user,
        uint256 indexed proposalId,
        address indexed delegate
    );
    
    event DelegatedVoteCast(
        uint256 indexed proposalId,
        address indexed delegate,
        address indexed user,
        string choice
    );
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(AI_ADMIN_ROLE, msg.sender);
        _setupRole(AI_VOTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Authorize or deauthorize an AI agent
     * @param agent Agent address
     * @param authorized Authorization status
     * @param metadataURI Metadata URI with agent info
     */
    function authorizeAIAgent(address agent, bool authorized, string memory metadataURI) external {
        require(hasRole(AI_ADMIN_ROLE, msg.sender), "Must have admin role");
        
        aiAgents[agent].isAuthorized = authorized;
        aiAgents[agent].metadataURI = metadataURI;
        aiAgents[agent].lastUpdated = block.timestamp;
        
        if (authorized) {
            grantRole(AI_VOTER_ROLE, agent);
        } else {
            revokeRole(AI_VOTER_ROLE, agent);
        }
        
        emit AIAgentAuthorized(agent, authorized);
    }
    
    /**
     * @dev Register an AI vote on a proposal
     * @param proposalId Proposal ID
     * @param choice Option chosen by AI
     * @param reason Reasoning for the vote
     * @param confidence Confidence level (1-100)
     */
    function registerAIVote(
        uint256 proposalId,
        string memory choice,
        string memory reason,
        uint256 confidence
    ) external {
        require(hasRole(AI_VOTER_ROLE, msg.sender), "Must have AI voter role");
        require(aiAgents[msg.sender].isAuthorized, "AI agent not authorized");
        require(confidence <= 100, "Confidence must be 0-100");
        
        aiVotes[proposalId] = AIVote({
            proposalId: proposalId,
            choice: choice,
            reason: reason,
            confidence: confidence,
            timestamp: block.timestamp
        });
        
        aiAgents[msg.sender].totalVotes++;
        aiAgents[msg.sender].lastUpdated = block.timestamp;
        
        emit AIVoteRegistered(
            proposalId,
            msg.sender,
            choice,
            reason,
            confidence,
            block.timestamp
        );
    }
    
    /**
     * @dev Update user's AI agent settings
     * @param user User address
     * @param enabled Whether AI agent is enabled
     * @param autoVote Whether automatic voting is enabled
     * @param confidenceThreshold Minimum confidence threshold for auto-voting
     */
    function updateAgentSettings(
        address user,
        bool enabled,
        bool autoVote,
        uint256 confidenceThreshold
    ) external {
        require(
            user == msg.sender || hasRole(AI_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        require(confidenceThreshold <= 100, "Threshold must be 0-100");
        
        UserAgentSettings storage settings = userSettings[user];
        settings.isEnabled = enabled;
        settings.autoVoteEnabled = autoVote;
        settings.confidenceThreshold = confidenceThreshold;
        settings.lastUpdated = block.timestamp;
        
        emit UserAgentSettingsUpdated(
            user,
            enabled,
            autoVote,
            confidenceThreshold
        );
    }
    
    /**
     * @dev Update user's keywords for AI-assisted voting
     * @param user User address
     * @param keywords Array of keywords
     */
    function updateKeywords(address user, string[] calldata keywords) external {
        require(msg.sender == user, "Only user can update their keywords");
        userSettings[user].keywords = keywords;
        userSettings[user].lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Update user's categories for AI-assisted voting
     * @param user User address
     * @param categories Array of categories
     */
    function updateCategories(address user, string[] calldata categories) external {
        require(msg.sender == user, "Only user can update their categories");
        userSettings[user].categories = categories;
        userSettings[user].lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Delegate voting for a specific proposal to another address
     * @param proposalId Proposal ID
     * @param delegate Address to delegate vote to
     */
    function delegateVote(uint256 proposalId, address delegate) external {
        require(delegate != address(0), "Cannot delegate to zero address");
        require(delegate != msg.sender, "Cannot delegate to self");
        
        voteDelegations[msg.sender][proposalId] = delegate;
        delegatedVotesCount[proposalId]++;
        
        emit VoteDelegated(msg.sender, proposalId, delegate);
    }
    
    /**
     * @dev Cast votes on behalf of users who delegated their vote
     * @param proposalId Proposal ID
     * @param choice Option to vote for
     * @param delegators Array of users who delegated their votes
     * @return Number of votes successfully cast
     */
    function castDelegatedVotes(
        uint256 proposalId,
        string memory choice,
        address[] calldata delegators
    ) external nonReentrant returns (uint256) {
        uint256 successfulVotes = 0;
        
        for (uint256 i = 0; i < delegators.length; i++) {
            address delegator = delegators[i];
            
            // Check if this user has delegated their vote to the caller
            if (voteDelegations[delegator][proposalId] == msg.sender) {
                // In a real implementation, this would call the governance contract's vote function
                // For this contract, we're just tracking it
                
                // Remove the delegation
                voteDelegations[delegator][proposalId] = address(0);
                delegatedVotesCount[proposalId]--;
                
                emit DelegatedVoteCast(proposalId, msg.sender, delegator, choice);
                successfulVotes++;
            }
        }
        
        return successfulVotes;
    }
    
    /**
     * @dev Get AI vote recommendation for a proposal
     * @param proposalId Proposal ID
     * @return choice Option chosen by AI
     * @return reason Reasoning for the vote
     * @return confidence Confidence level (1-100)
     * @return timestamp Timestamp of the vote
     */
    function getAIVote(uint256 proposalId) external view returns (
        string memory choice,
        string memory reason,
        uint256 confidence,
        uint256 timestamp
    ) {
        AIVote memory vote = aiVotes[proposalId];
        return (vote.choice, vote.reason, vote.confidence, vote.timestamp);
    }
    
    /**
     * @dev Get user's agent settings
     * @param user User address
     * @return User's AI agent settings
     */
    function getAgentSettings(address user) external view returns (
        bool isEnabled,
        bool autoVoteEnabled,
        uint256 confidenceThreshold,
        uint256 lastUpdated,
        string[] memory keywords,
        string[] memory categories
    ) {
        UserAgentSettings storage settings = userSettings[user];
        return (
            settings.isEnabled,
            settings.autoVoteEnabled,
            settings.confidenceThreshold,
            settings.lastUpdated,
            settings.keywords,
            settings.categories
        );
    }
    
    /**
     * @dev Get AI agent information
     * @param agent Agent address
     * @return isAuthorized Whether agent is authorized
     * @return totalVotes Total votes cast by agent
     * @return successfulVotes Successful votes cast by agent
     * @return metadataURI Metadata URI with agent info
     * @return lastUpdated Last update timestamp
     */
    function getAIAgent(address agent) external view returns (
        bool isAuthorized,
        uint256 totalVotes,
        uint256 successfulVotes,
        string memory metadataURI,
        uint256 lastUpdated
    ) {
        AIAgent memory agentInfo = aiAgents[agent];
        return (
            agentInfo.isAuthorized,
            agentInfo.totalVotes,
            agentInfo.successfulVotes,
            agentInfo.metadataURI,
            agentInfo.lastUpdated
        );
    }
    
    /**
     * @dev Check who a user has delegated their vote to for a specific proposal
     * @param user User address
     * @param proposalId Proposal ID
     * @return Delegate address (address(0) if not delegated)
     */
    function getDelegatedVoter(address user, uint256 proposalId) external view returns (address) {
        return voteDelegations[user][proposalId];
    }
}
