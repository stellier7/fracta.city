// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ComplianceManager.sol";

/**
 * @title PropertyToken
 * @dev ERC-1404 compliant token representing fractional ownership of real estate
 */
contract PropertyToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    // Property information
    struct PropertyInfo {
        string propertyName;
        string location;
        string jurisdiction; // "prospera" or "international"
        uint256 totalPropertyValue; // Total property value in USD
        uint256 totalTokens; // Total tokens representing the property
        string propertyType; // "studio", "villa", "condo", etc.
        uint256 squareFeet;
        uint256 expectedYield; // Expected annual yield in basis points (e.g., 850 = 8.5%)
        string imageURI;
        bool isActive;
    }
    
    PropertyInfo public property;
    ComplianceManager public complianceManager;
    
    // Token sale information
    uint256 public tokenPrice; // Price per token in wei
    uint256 public tokensSold;
    uint256 public saleStartTime;
    uint256 public saleEndTime;
    bool public saleActive;
    
    // Revenue distribution
    uint256 public totalDividendsDistributed;
    mapping(address => uint256) public dividendsClaimed;
    mapping(address => uint256) public dividendsEarned;
    
    // Transfer restrictions
    mapping(address => bool) public authorizedTransfers; // Addresses allowed to transfer without restrictions
    
    // Events
    event PropertyTokensIssued(address indexed to, uint256 amount, uint256 price);
    event DividendDistributed(uint256 totalAmount, uint256 perToken);
    event DividendClaimed(address indexed user, uint256 amount);
    event PropertyInfoUpdated();
    event SaleStatusChanged(bool active);
    event TransferRestricted(address indexed from, address indexed to, uint256 amount, string reason);
    
    // ERC-1404 Error Codes
    uint8 public constant SUCCESS_CODE = 0;
    uint8 public constant FAILURE_NON_WHITELIST = 1;
    uint8 public constant FAILURE_PAUSED = 2;
    uint8 public constant FAILURE_KYC = 3;
    uint8 public constant FAILURE_JURISDICTION = 4;
    
    mapping(uint8 => string) public errorMessages;
    
    constructor(
        string memory _propertyName,
        string memory _location,
        string memory _jurisdiction,
        uint256 _totalPropertyValue,
        uint256 _totalTokens,
        uint256 _tokenPrice,
        address _complianceManager
    ) ERC20(
        string(abi.encodePacked("Fracta ", _propertyName)), 
        "FPT"
    ) Ownable() {
        property = PropertyInfo({
            propertyName: _propertyName,
            location: _location,
            jurisdiction: _jurisdiction,
            totalPropertyValue: _totalPropertyValue,
            totalTokens: _totalTokens,
            propertyType: "",
            squareFeet: 0,
            expectedYield: 0,
            imageURI: "",
            isActive: true
        });
        
        tokenPrice = _tokenPrice;
        complianceManager = ComplianceManager(_complianceManager);
        
        // Initialize error messages
        errorMessages[SUCCESS_CODE] = "Transfer successful";
        errorMessages[FAILURE_NON_WHITELIST] = "Transfer not authorized";
        errorMessages[FAILURE_PAUSED] = "Contract is paused";
        errorMessages[FAILURE_KYC] = "KYC verification required";
        errorMessages[FAILURE_JURISDICTION] = "Jurisdiction requirements not met";
        
        // Mint initial supply to contract for sale
        _mint(address(this), _totalTokens);
    }
    
    /**
     * @dev Start token sale
     */
    function startSale(uint256 _duration) external onlyOwner {
        saleStartTime = block.timestamp;
        saleEndTime = block.timestamp + _duration;
        saleActive = true;
        
        emit SaleStatusChanged(true);
    }
    
    /**
     * @dev End token sale
     */
    function endSale() external onlyOwner {
        saleActive = false;
        saleEndTime = block.timestamp;
        
        emit SaleStatusChanged(false);
    }
    
    /**
     * @dev Purchase tokens (payable function)
     */
    function purchaseTokens(uint256 _tokenAmount) external payable nonReentrant whenNotPaused {
        require(saleActive, "Sale is not active");
        require(block.timestamp >= saleStartTime && block.timestamp <= saleEndTime, "Sale period invalid");
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        
        uint256 totalCost = _tokenAmount * tokenPrice;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Check compliance
        (bool canInvest, string memory reason) = complianceManager.canInvest(
            msg.sender, 
            address(this), 
            _tokenAmount
        );
        require(canInvest, reason);
        
        require(balanceOf(address(this)) >= _tokenAmount, "Not enough tokens available");
        
        // Transfer tokens from contract to buyer
        _transfer(address(this), msg.sender, _tokenAmount);
        tokensSold += _tokenAmount;
        
        // Record investment in compliance manager
        complianceManager.recordInvestment(msg.sender, address(this), _tokenAmount);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit PropertyTokensIssued(msg.sender, _tokenAmount, tokenPrice);
    }
    
    /**
     * @dev Distribute dividends to token holders
     */
    function distributeDividends() external payable onlyOwner {
        require(msg.value > 0, "No dividends to distribute");
        require(tokensSold > 0, "No tokens sold yet");
        
        uint256 dividendPerToken = msg.value / tokensSold;
        totalDividendsDistributed += msg.value;
        
        // Update dividends earned for all token holders
        // In practice, this would be done off-chain and claimed individually
        emit DividendDistributed(msg.value, dividendPerToken);
    }
    
    /**
     * @dev Claim dividends
     */
    function claimDividends() external nonReentrant {
        uint256 userBalance = balanceOf(msg.sender);
        require(userBalance > 0, "No tokens held");
        
        uint256 dividendPerToken = totalDividendsDistributed / tokensSold;
        uint256 totalEarned = userBalance * dividendPerToken;
        uint256 claimableAmount = totalEarned - dividendsClaimed[msg.sender];
        
        require(claimableAmount > 0, "No dividends to claim");
        require(address(this).balance >= claimableAmount, "Insufficient contract balance");
        
        dividendsClaimed[msg.sender] += claimableAmount;
        payable(msg.sender).transfer(claimableAmount);
        
        emit DividendClaimed(msg.sender, claimableAmount);
    }
    
    /**
     * @dev ERC-1404 compliance check
     */
    function detectTransferRestriction(
        address from,
        address to,
        uint256 amount
    ) public view returns (uint8) {
        if (paused()) return FAILURE_PAUSED;
        
        // Allow transfers from/to the contract itself
        if (from == address(this) || to == address(this)) return SUCCESS_CODE;
        
        // Allow authorized transfers
        if (authorizedTransfers[from] || authorizedTransfers[to]) return SUCCESS_CODE;
        
        // Check compliance
        (bool canTransfer,) = complianceManager.canTransfer(from, to, address(this), amount);
        if (!canTransfer) return FAILURE_KYC;
        
        return SUCCESS_CODE;
    }
    
    /**
     * @dev Get message for transfer restriction code
     */
    function messageForTransferRestriction(uint8 restrictionCode) external view returns (string memory) {
        return errorMessages[restrictionCode];
    }
    
    /**
     * @dev Override transfer to include compliance checks
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip checks for minting/burning
        if (from == address(0) || to == address(0)) return;
        
        uint8 restrictionCode = detectTransferRestriction(from, to, amount);
        if (restrictionCode != SUCCESS_CODE) {
            emit TransferRestricted(from, to, amount, errorMessages[restrictionCode]);
            revert(errorMessages[restrictionCode]);
        }
    }
    
    /**
     * @dev Update property information
     */
    function updatePropertyInfo(
        string memory _propertyType,
        uint256 _squareFeet,
        uint256 _expectedYield,
        string memory _imageURI
    ) external onlyOwner {
        property.propertyType = _propertyType;
        property.squareFeet = _squareFeet;
        property.expectedYield = _expectedYield;
        property.imageURI = _imageURI;
        
        emit PropertyInfoUpdated();
    }
    
    /**
     * @dev Set authorized transfer addresses
     */
    function setAuthorizedTransfer(address _address, bool _authorized) external onlyOwner {
        authorizedTransfers[_address] = _authorized;
    }
    
    /**
     * @dev Update token price
     */
    function updateTokenPrice(uint256 _newPrice) external onlyOwner {
        tokenPrice = _newPrice;
    }
    
    /**
     * @dev Get property details
     */
    function getPropertyInfo() external view returns (PropertyInfo memory) {
        return property;
    }
    
    /**
     * @dev Get sale information
     */
    function getSaleInfo() external view returns (
        uint256 _tokenPrice,
        uint256 _tokensSold,
        uint256 _tokensRemaining,
        uint256 _saleStartTime,
        uint256 _saleEndTime,
        bool _saleActive
    ) {
        return (
            tokenPrice,
            tokensSold,
            balanceOf(address(this)),
            saleStartTime,
            saleEndTime,
            saleActive && block.timestamp >= saleStartTime && block.timestamp <= saleEndTime
        );
    }
    
    /**
     * @dev Get dividend information for a user
     */
    function getDividendInfo(address user) external view returns (
        uint256 totalEarned,
        uint256 claimed,
        uint256 claimable
    ) {
        uint256 userBalance = balanceOf(user);
        if (tokensSold == 0) return (0, 0, 0);
        
        uint256 dividendPerToken = totalDividendsDistributed / tokensSold;
        totalEarned = userBalance * dividendPerToken;
        claimed = dividendsClaimed[user];
        claimable = totalEarned > claimed ? totalEarned - claimed : 0;
    }
    
    /**
     * @dev Emergency functions
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
} 