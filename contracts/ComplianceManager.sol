// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ComplianceManager
 * @dev Manages KYC verification and transfer restrictions for Fracta.city
 */
contract ComplianceManager is Ownable, Pausable {
    // KYC status for addresses
    mapping(address => bool) public kycApproved;
    mapping(address => string) public kycJurisdiction; // "prospera" or "international"
    mapping(address => uint256) public kycExpiry;
    
    // Prospera-specific permits
    mapping(address => string) public prosperaPermitId;
    mapping(address => bool) public prosperaPermitValid;
    
    // Jurisdiction-based property access
    mapping(address => bool) public prosperaProperties; // Properties requiring Prospera permit
    mapping(address => bool) public internationalProperties; // Properties for international investors
    
    // Investment limits per jurisdiction
    mapping(string => uint256) public maxInvestmentPerProperty;
    mapping(address => mapping(address => uint256)) public userInvestments; // user -> property -> amount
    
    // Events
    event KYCApproved(address indexed user, string jurisdiction);
    event KYCRevoked(address indexed user);
    event ProspectsPermitRegistered(address indexed user, string permitId);
    event PropertyJurisdictionSet(address indexed property, bool requiresProspera, bool allowsInternational);
    event TransferRestricted(address indexed from, address indexed to, address indexed property, string reason);
    
    constructor() Ownable() {}
    
    /**
     * @dev Approve KYC for a user
     */
    function approveKYC(
        address user, 
        string memory jurisdiction, 
        uint256 expiryTimestamp
    ) external onlyOwner {
        kycApproved[user] = true;
        kycJurisdiction[user] = jurisdiction;
        kycExpiry[user] = expiryTimestamp;
        
        emit KYCApproved(user, jurisdiction);
    }
    
    /**
     * @dev Register Prospera permit for a user
     */
    function registerProspectsPermit(
        address user, 
        string memory permitId
    ) external onlyOwner {
        require(kycApproved[user], "User must have KYC approval first");
        require(
            keccak256(abi.encodePacked(kycJurisdiction[user])) == keccak256(abi.encodePacked("prospera")),
            "User jurisdiction must be Prospera"
        );
        
        prosperaPermitId[user] = permitId;
        prosperaPermitValid[user] = true;
        
        emit ProspectsPermitRegistered(user, permitId);
    }
    
    /**
     * @dev Revoke KYC for a user
     */
    function revokeKYC(address user) external onlyOwner {
        kycApproved[user] = false;
        prosperaPermitValid[user] = false;
        delete kycJurisdiction[user];
        delete kycExpiry[user];
        delete prosperaPermitId[user];
        
        emit KYCRevoked(user);
    }
    
    /**
     * @dev Set property jurisdiction requirements
     */
    function setPropertyJurisdiction(
        address property,
        bool requiresProspera,
        bool allowsInternational
    ) external onlyOwner {
        prosperaProperties[property] = requiresProspera;
        internationalProperties[property] = allowsInternational;
        
        emit PropertyJurisdictionSet(property, requiresProspera, allowsInternational);
    }
    
    /**
     * @dev Set maximum investment limits per jurisdiction
     */
    function setMaxInvestment(
        string memory jurisdiction,
        uint256 maxAmount
    ) external onlyOwner {
        maxInvestmentPerProperty[jurisdiction] = maxAmount;
    }
    
    /**
     * @dev Check if user can invest in a specific property
     */
    function canInvest(
        address user, 
        address property, 
        uint256 amount
    ) external view returns (bool, string memory) {
        // Check if KYC is approved and not expired
        if (!kycApproved[user]) {
            return (false, "KYC not approved");
        }
        
        if (block.timestamp > kycExpiry[user]) {
            return (false, "KYC expired");
        }
        
        // Check jurisdiction requirements
        string memory userJurisdiction = kycJurisdiction[user];
        
        if (prosperaProperties[property]) {
            // Property requires Prospera permit
            if (keccak256(abi.encodePacked(userJurisdiction)) != keccak256(abi.encodePacked("prospera"))) {
                return (false, "Prospera permit required");
            }
            if (!prosperaPermitValid[user]) {
                return (false, "Invalid Prospera permit");
            }
        } else if (internationalProperties[property]) {
            // Property allows international investors
            if (keccak256(abi.encodePacked(userJurisdiction)) != keccak256(abi.encodePacked("prospera")) &&
                keccak256(abi.encodePacked(userJurisdiction)) != keccak256(abi.encodePacked("international"))) {
                return (false, "Invalid jurisdiction for this property");
            }
        } else {
            return (false, "Property jurisdiction not configured");
        }
        
        // Check investment limits
        uint256 maxAmount = maxInvestmentPerProperty[userJurisdiction];
        if (maxAmount > 0 && userInvestments[user][property] + amount > maxAmount) {
            return (false, "Investment limit exceeded");
        }
        
        return (true, "");
    }
    
    /**
     * @dev Check if transfer is allowed between addresses for a property
     */
    function canTransfer(
        address from,
        address to,
        address property,
        uint256 amount
    ) external view returns (bool, string memory) {
        // Both addresses must have valid KYC
        if (!kycApproved[from] || !kycApproved[to]) {
            return (false, "Both parties must have KYC approval");
        }
        
        if (block.timestamp > kycExpiry[from] || block.timestamp > kycExpiry[to]) {
            return (false, "KYC expired for one or both parties");
        }
        
        // Check if recipient can invest in this property
        return this.canInvest(to, property, amount);
    }
    
    /**
     * @dev Record investment for compliance tracking
     */
    function recordInvestment(
        address user,
        address property,
        uint256 amount
    ) external {
        // This should only be called by authorized property token contracts
        require(
            prosperaProperties[property] || internationalProperties[property],
            "Property not registered"
        );
        
        userInvestments[user][property] += amount;
    }
    
    /**
     * @dev Get user compliance status
     */
    function getUserComplianceStatus(address user) external view returns (
        bool kycValid,
        string memory jurisdiction,
        uint256 expiry,
        bool hasProspectsPermit,
        string memory permitId
    ) {
        return (
            kycApproved[user] && block.timestamp <= kycExpiry[user],
            kycJurisdiction[user],
            kycExpiry[user],
            prosperaPermitValid[user],
            prosperaPermitId[user]
        );
    }
    
    /**
     * @dev Emergency pause functionality
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Check if system is operational
     */
    modifier whenOperational() {
        require(!paused(), "System is paused");
        _;
    }
} 