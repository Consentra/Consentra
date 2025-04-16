
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AIAgentRegistry
 * @dev Registry for AI agents and user agent settings
 * Compatible with Hedera and other EVM-based chains
 */
contract AIAgentRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant AI_ADMIN_ROLE = keccak256("AI_ADMIN_ROLE");
    bytes32 public constant AI_OPERATOR_ROLE = keccak256("AI_OPERATOR_ROLE");
    
    struct AgentSettings {
        bool isEnabled;
        bool autoVoteEnabled;
        uint256 lastUpdated;
        string[] keywords;
        string[] categories;
        uint256 confidenceThreshold;
        bool notificationsEnabled;
    }
    
    struct AIModel {
        string name;
        string version;
        string provider;
        bool isApproved;
        address owner;
        string description;
        string metadataURI;
    }
    
    // User address => Agent settings
    mapping(address => AgentSettings) public userSettings;
    
    // Model ID => Model details
    mapping(bytes32 => AIModel) public aiModels;
    bytes32[] public modelIds;
    
    // Organization ID => Approved AI Model IDs
    mapping(bytes32 => bytes32[]) public orgApprovedModels;
    
    event AgentSettingsUpdated(
        address indexed user,
        bool isEnabled,
        bool autoVoteEnabled,
        uint256 lastUpdated,
        uint256 confidenceThreshold
    );
    
    event KeywordsUpdated(address indexed user, string[] keywords);
    event CategoriesUpdated(address indexed user, string[] categories);
    
    event AIModelRegistered(
        bytes32 indexed modelId,
        string name,
        string version,
        address owner
    );
    
    event AIModelApprovalChanged(bytes32 indexed modelId, bool approved);
    
    event OrganizationModelApproved(
        bytes32 indexed organizationId,
        bytes32 indexed modelId,
        bool approved
    );
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(AI_ADMIN_ROLE, msg.sender);
        _setupRole(AI_OPERATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Update agent settings for a user
     * @param user User address
     * @param enabled Whether agent is enabled
     * @param autoVote Whether auto-voting is enabled
     * @param confidenceThreshold Minimum confidence for auto-voting (0-100)
     * @param notificationsEnabled Whether notifications are enabled
     */
    function updateAgentSettings(
        address user,
        bool enabled,
        bool autoVote,
        uint256 confidenceThreshold,
        bool notificationsEnabled
    ) external {
        require(
            hasRole(AI_ADMIN_ROLE, msg.sender) || msg.sender == user,
            "Unauthorized"
        );
        require(confidenceThreshold <= 100, "Threshold must be 0-100");
        
        AgentSettings storage settings = userSettings[user];
        settings.isEnabled = enabled;
        settings.autoVoteEnabled = autoVote;
        settings.lastUpdated = block.timestamp;
        settings.confidenceThreshold = confidenceThreshold;
        settings.notificationsEnabled = notificationsEnabled;
        
        emit AgentSettingsUpdated(
            user,
            enabled,
            autoVote,
            block.timestamp,
            confidenceThreshold
        );
    }
    
    /**
     * @dev Update keywords for a user's agent settings
     * @param user User address
     * @param keywords Array of keywords
     */
    function updateKeywords(address user, string[] calldata keywords) external {
        require(msg.sender == user, "Only user can update their keywords");
        userSettings[user].keywords = keywords;
        emit KeywordsUpdated(user, keywords);
    }
    
    /**
     * @dev Update categories for a user's agent settings
     * @param user User address
     * @param categories Array of categories
     */
    function updateCategories(address user, string[] calldata categories) external {
        require(msg.sender == user, "Only user can update their categories");
        userSettings[user].categories = categories;
        emit CategoriesUpdated(user, categories);
    }
    
    /**
     * @dev Register a new AI model
     * @param name Model name
     * @param version Model version
     * @param provider Provider name
     * @param description Model description
     * @param metadataURI URI for additional metadata
     * @return modelId ID of the registered model
     */
    function registerAIModel(
        string memory name,
        string memory version,
        string memory provider,
        string memory description,
        string memory metadataURI
    ) external returns (bytes32) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(version).length > 0, "Version cannot be empty");
        
        bytes32 modelId = keccak256(abi.encodePacked(name, version, provider, msg.sender));
        
        // Ensure model doesn't already exist
        require(bytes(aiModels[modelId].name).length == 0, "Model already registered");
        
        aiModels[modelId] = AIModel({
            name: name,
            version: version,
            provider: provider,
            isApproved: false,  // Requires admin approval
            owner: msg.sender,
            description: description,
            metadataURI: metadataURI
        });
        
        modelIds.push(modelId);
        
        emit AIModelRegistered(modelId, name, version, msg.sender);
        return modelId;
    }
    
    /**
     * @dev Approve or revoke approval for an AI model
     * @param modelId Model ID
     * @param approved Approval status
     */
    function setModelApproval(bytes32 modelId, bool approved) external {
        require(hasRole(AI_ADMIN_ROLE, msg.sender), "Must have admin role");
        require(bytes(aiModels[modelId].name).length > 0, "Model does not exist");
        
        aiModels[modelId].isApproved = approved;
        
        emit AIModelApprovalChanged(modelId, approved);
    }
    
    /**
     * @dev Approve an AI model for an organization
     * @param organizationId Organization ID
     * @param modelId Model ID
     * @param approved Approval status
     */
    function setOrganizationModelApproval(
        bytes32 organizationId,
        bytes32 modelId,
        bool approved
    ) external {
        require(hasRole(AI_ADMIN_ROLE, msg.sender), "Must have admin role");
        require(bytes(aiModels[modelId].name).length > 0, "Model does not exist");
        
        if (approved) {
            // Check if already approved
            bytes32[] storage approvedModels = orgApprovedModels[organizationId];
            bool alreadyApproved = false;
            
            for (uint256 i = 0; i < approvedModels.length; i++) {
                if (approvedModels[i] == modelId) {
                    alreadyApproved = true;
                    break;
                }
            }
            
            if (!alreadyApproved) {
                orgApprovedModels[organizationId].push(modelId);
            }
        } else {
            // Remove from approved list
            bytes32[] storage approvedModels = orgApprovedModels[organizationId];
            
            for (uint256 i = 0; i < approvedModels.length; i++) {
                if (approvedModels[i] == modelId) {
                    // Replace with the last element and pop
                    approvedModels[i] = approvedModels[approvedModels.length - 1];
                    approvedModels.pop();
                    break;
                }
            }
        }
        
        emit OrganizationModelApproved(organizationId, modelId, approved);
    }
    
    /**
     * @dev Get agent settings for a user
     * @param user User address
     * @return isEnabled Whether agent is enabled
     * @return autoVoteEnabled Whether auto-voting is enabled
     * @return lastUpdated Last update timestamp
     * @return confidenceThreshold Minimum confidence for auto-voting
     * @return notificationsEnabled Whether notifications are enabled
     * @return keywords User's keywords
     * @return categories User's categories
     */
    function getAgentSettings(address user) external view returns (
        bool isEnabled,
        bool autoVoteEnabled,
        uint256 lastUpdated,
        uint256 confidenceThreshold,
        bool notificationsEnabled,
        string[] memory keywords,
        string[] memory categories
    ) {
        AgentSettings storage settings = userSettings[user];
        return (
            settings.isEnabled,
            settings.autoVoteEnabled,
            settings.lastUpdated,
            settings.confidenceThreshold,
            settings.notificationsEnabled,
            settings.keywords,
            settings.categories
        );
    }
    
    /**
     * @dev Get AI model details
     * @param modelId Model ID
     * @return name Model name
     * @return version Model version
     * @return provider Provider name
     * @return isApproved Whether model is approved
     * @return owner Model owner address
     * @return description Model description
     * @return metadataURI URI for additional metadata
     */
    function getAIModel(bytes32 modelId) external view returns (
        string memory name,
        string memory version,
        string memory provider,
        bool isApproved,
        address owner,
        string memory description,
        string memory metadataURI
    ) {
        AIModel memory model = aiModels[modelId];
        require(bytes(model.name).length > 0, "Model does not exist");
        
        return (
            model.name,
            model.version,
            model.provider,
            model.isApproved,
            model.owner,
            model.description,
            model.metadataURI
        );
    }
    
    /**
     * @dev Get approved AI models for an organization
     * @param organizationId Organization ID
     * @return Array of approved model IDs
     */
    function getApprovedModelsForOrg(bytes32 organizationId) external view returns (bytes32[] memory) {
        return orgApprovedModels[organizationId];
    }
    
    /**
     * @dev Get all registered AI model IDs
     * @return Array of model IDs
     */
    function getAllModelIds() external view returns (bytes32[] memory) {
        return modelIds;
    }
    
    /**
     * @dev Check if a model is approved for an organization
     * @param organizationId Organization ID
     * @param modelId Model ID
     * @return Whether model is approved for the organization
     */
    function isModelApprovedForOrg(bytes32 organizationId, bytes32 modelId) external view returns (bool) {
        bytes32[] memory approvedModels = orgApprovedModels[organizationId];
        
        for (uint256 i = 0; i < approvedModels.length; i++) {
            if (approvedModels[i] == modelId) {
                return true;
            }
        }
        
        return false;
    }
}
