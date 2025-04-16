
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract OrganizationFactory is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct Organization {
        string name;
        string description;
        address creator;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(bytes32 => Organization) public organizations;
    bytes32[] public organizationIds;
    
    event OrganizationCreated(bytes32 indexed id, string name, address creator);
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }
    
    function createOrganization(
        string memory name,
        string memory description
    ) external nonReentrant returns (bytes32) {
        bytes32 orgId = keccak256(abi.encodePacked(name, msg.sender, block.timestamp));
        require(!organizations[orgId].exists, "Organization already exists");
        
        organizations[orgId] = Organization({
            name: name,
            description: description,
            creator: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
        
        organizationIds.push(orgId);
        emit OrganizationCreated(orgId, name, msg.sender);
        return orgId;
    }
    
    function getOrganization(bytes32 orgId) 
        external 
        view 
        returns (
            string memory name,
            string memory description,
            address creator,
            uint256 createdAt
        ) 
    {
        Organization memory org = organizations[orgId];
        require(org.exists, "Organization does not exist");
        return (org.name, org.description, org.creator, org.createdAt);
    }
}
