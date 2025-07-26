// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ComplianceManager is Ownable, Pausable {
    mapping(address => bool) public kycApproved;
    mapping(address => string) public kycJurisdiction;
    mapping(address => uint256) public kycExpiry;
    mapping(address => string) public prosperaPermitId;
    mapping(address => bool) public prosperaPermitValid;
    mapping(address => bool) public prosperaProperties;
    mapping(address => bool) public internationalProperties;
    mapping(string => uint256) public maxInvestmentPerProperty;
    mapping(address => mapping(address => uint256)) public userInvestments;
    
    event KYCApproved(address indexed user, string jurisdiction);
    event KYCRevoked(address indexed user);
    event ProspectsPermitRegistered(address indexed user, string permitId);
    event PropertyJurisdictionSet(address indexed property, bool requiresProspera, bool allowsInternational);
    
    constructor() {}
    
    function approveKYC(address user, string memory jurisdiction, uint256 expiryTimestamp) external onlyOwner {
        kycApproved[user] = true;
        kycJurisdiction[user] = jurisdiction;
        kycExpiry[user] = expiryTimestamp;
        emit KYCApproved(user, jurisdiction);
    }
    
    function setPropertyJurisdiction(address property, bool requiresProspera, bool allowsInternational) external onlyOwner {
        prosperaProperties[property] = requiresProspera;
        internationalProperties[property] = allowsInternational;
        emit PropertyJurisdictionSet(property, requiresProspera, allowsInternational);
    }
    
    function canInvest(address user, address property, uint256 amount) external view returns (bool, string memory) {
        if (!kycApproved[user]) {
            return (false, "KYC not approved");
        }
        if (block.timestamp > kycExpiry[user]) {
            return (false, "KYC expired");
        }
        return (true, "");
    }
    
    function canTransfer(address from, address to, address property, uint256 amount) external view returns (bool, string memory) {
        if (!kycApproved[from] || !kycApproved[to]) {
            return (false, "Both parties must have KYC approval");
        }
        if (block.timestamp > kycExpiry[from] || block.timestamp > kycExpiry[to]) {
            return (false, "KYC expired for one or both parties");
        }
        return this.canInvest(to, property, amount);
    }
    
    function recordInvestment(address user, address property, uint256 amount) external {
        require(prosperaProperties[property] || internationalProperties[property], "Property not registered");
        userInvestments[user][property] += amount;
    }
    
    function registerProspectsPermit(address user, string memory permitId) external onlyOwner {
        require(kycApproved[user], "User must have KYC approval first");
        prosperaPermitId[user] = permitId;
        prosperaPermitValid[user] = true;
        emit ProspectsPermitRegistered(user, permitId);
    }
    
    function getUserComplianceStatus(address user) external view returns (bool kycValid, string memory jurisdiction, uint256 expiry, bool hasProspectsPermit, string memory permitId) {
        return (kycApproved[user] && block.timestamp <= kycExpiry[user], kycJurisdiction[user], kycExpiry[user], prosperaPermitValid[user], prosperaPermitId[user]);
    }
}
