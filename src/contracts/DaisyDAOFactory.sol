
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./DaisyGovernance.sol";

/**
 * @title DaisyDAOFactory
 * @dev Factory contract for creating and managing DAO organizations
 * Compatible with Hedera and other EVM-based chains
 */
contract DaisyDAOFactory is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");
    
    struct Organization {
        string name;
        string description;
        address owner;
        address governanceAddress;
        uint256 createdAt;
        bool exists;
        string metadataURI;
    }
    
    // Organization ID => Organization details
    mapping(bytes32 => Organization) public organizations;
    bytes32[] public organizationIds;
    
    // Address => Organization IDs array
    mapping(address => bytes32[]) public userOrganizations;
    
    event OrganizationCreated(
        bytes32 indexed id, 
        string name, 
        address indexed owner,
        address governanceAddress
    );
    
    event OrganizationUpdated(
        bytes32 indexed id, 
        string name, 
        string description,
        string metadataURI
    );
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(DEPLOYER_ROLE, msg.sender);
    }
    
    /**
     * @dev Creates a new organization with a dedicated governance contract
     * @param name Organization name
     * @param description Organization description
     * @param metadataURI URI for additional metadata (IPFS usually)
     * @param votingPeriod Duration of voting period in seconds
     * @param quorumPercentage Minimum percentage of votes required
     * @return organizationId The unique identifier for the new organization
     */
    function createOrganization(
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 votingPeriod,
        uint256 quorumPercentage
    ) external nonReentrant returns (bytes32) {
        require(bytes(name).length > 0, "Organization name cannot be empty");
        
        bytes32 orgId = keccak256(abi.encodePacked(name, msg.sender, block.timestamp));
        require(!organizations[orgId].exists, "Organization ID already exists");
        
        // Deploy a new governance contract for this organization
        DaisyGovernance governance = new DaisyGovernance(
            msg.sender,
            votingPeriod,
            quorumPercentage
        );
        
        // Store organization details
        organizations[orgId] = Organization({
            name: name,
            description: description,
            owner: msg.sender,
            governanceAddress: address(governance),
            createdAt: block.timestamp,
            exists: true,
            metadataURI: metadataURI
        });
        
        // Add to global and user-specific lists
        organizationIds.push(orgId);
        userOrganizations[msg.sender].push(orgId);
        
        emit OrganizationCreated(orgId, name, msg.sender, address(governance));
        return orgId;
    }
    
    /**
     * @dev Updates an existing organization's metadata
     * @param orgId Organization ID
     * @param name New organization name
     * @param description New organization description
     * @param metadataURI New metadata URI
     */
    function updateOrganization(
        bytes32 orgId,
        string memory name,
        string memory description,
        string memory metadataURI
    ) external {
        require(organizations[orgId].exists, "Organization does not exist");
        require(organizations[orgId].owner == msg.sender || hasRole(ADMIN_ROLE, msg.sender), 
                "Only owner or admin can update");
        
        Organization storage org = organizations[orgId];
        
        if (bytes(name).length > 0) {
            org.name = name;
        }
        
        org.description = description;
        org.metadataURI = metadataURI;
        
        emit OrganizationUpdated(orgId, name, description, metadataURI);
    }
    
    /**
     * @dev Retrieves organization details
     * @param orgId Organization ID
     * @return Organization details (name, description, owner, etc.)
     */
    function getOrganization(bytes32 orgId) 
        external 
        view 
        returns (
            string memory name,
            string memory description,
            address owner,
            address governanceAddress,
            uint256 createdAt,
            string memory metadataURI
        ) 
    {
        Organization memory org = organizations[orgId];
        require(org.exists, "Organization does not exist");
        
        return (
            org.name, 
            org.description, 
            org.owner, 
            org.governanceAddress, 
            org.createdAt,
            org.metadataURI
        );
    }
    
    /**
     * @dev Gets all organizations created by a specific user
     * @param user The user address
     * @return Array of organization IDs
     */
    function getOrganizationsByUser(address user) external view returns (bytes32[] memory) {
        return userOrganizations[user];
    }
    
    /**
     * @dev Gets all organization IDs
     * @return Array of all organization IDs
     */
    function getAllOrganizations() external view returns (bytes32[] memory) {
        return organizationIds;
    }
    
    /**
     * @dev Checks if user is an organization owner
     * @param orgId Organization ID
     * @param user User address
     * @return True if user is the organization owner
     */
    function isOrganizationOwner(bytes32 orgId, address user) external view returns (bool) {
        return organizations[orgId].exists && organizations[orgId].owner == user;
    }
}
