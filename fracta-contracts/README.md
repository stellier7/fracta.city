# Fracta.city Smart Contracts 🏗️

**Tokenized Real Estate Platform - Smart Contracts for Base Blockchain**

## Overview

Fracta.city smart contracts enable fractional ownership of real estate through ERC-1404 compliant tokens with built-in KYC compliance and revenue distribution.

## 🏗️ Contract Architecture

### Core Contracts

1. **`ComplianceManager.sol`** - KYC and transfer restrictions
   - Manages Prospera permit verification
   - Handles international KYC compliance
   - Controls property access based on jurisdiction
   - Investment limit enforcement

2. **`PropertyToken.sol`** - ERC-1404 compliant property tokens
   - Represents fractional ownership of real estate
   - Built-in compliance checks for all transfers
   - Dividend distribution to token holders
   - Token sale management with KYC integration

3. **`TokenSale.sol`** - Property token sale factory
   - Creates and manages property token sales
   - Handles platform fees (2.5% default)
   - Multi-property sale management
   - Investment tracking and analytics

4. **`RevenueDistribution.sol`** - Dividend payment system
   - Manages rental income distribution
   - Multi-property revenue pools
   - Automated dividend calculations
   - Claimable rewards system

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Compilation
```bash
npm run compile
```

### Testing
```bash
npm run test
```

### Local Deployment
```bash
npm run deploy:local
```

### Base Testnet Deployment
```bash
# Set up .env file with PRIVATE_KEY and BASESCAN_API_KEY
npm run deploy:base-sepolia
```

## 🔧 Configuration

Create `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key
```

## 📊 Key Features

### ✅ KYC Compliance
- **Prospera Permit**: For Honduras properties
- **International KYC**: For global investors
- **Automated Restrictions**: Transfer controls based on compliance status

### ✅ Property Tokenization
- **ERC-1404 Standard**: Regulated token transfers
- **Fractional Ownership**: Minimum $100 investment
- **Compliance Integration**: Built-in KYC checks

### ✅ Revenue Distribution
- **Automated Dividends**: Rental income distribution
- **Pro-rata Payments**: Based on token ownership
- **Multi-property Support**: Separate revenue pools

### ✅ Platform Management
- **Decentralized Factory**: Create multiple property sales
- **Analytics Dashboard**: Investment tracking
- **Fee Management**: Platform revenue system

## 🌐 Network Configuration

### Base Testnet (Sepolia)
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia-explorer.base.org

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

## 📁 Contract Addresses

| Contract | Base Testnet | Base Mainnet |
|----------|--------------|--------------|
| ComplianceManager | TBD | TBD |
| TokenSale | TBD | TBD |
| RevenueDistribution | TBD | TBD |

## 🧪 Testing

Run comprehensive test suite:
```bash
npm run test
```

With gas reporting:
```bash
npm run test:gas
```

## 🔐 Security Features

- **OpenZeppelin**: Battle-tested contract libraries
- **Reentrancy Protection**: All payable functions protected
- **Access Control**: Owner-only admin functions
- **Pausable**: Emergency stop functionality
- **Transfer Restrictions**: ERC-1404 compliance enforcement

## 📋 Deployment Process

1. **ComplianceManager** → Deploy first
2. **TokenSale** → Deploy with ComplianceManager address
3. **RevenueDistribution** → Deploy with platform fee recipient
4. **PropertyToken** → Deploy via TokenSale factory

## 🏠 Property Integration

### Example Property Creation
```solidity
tokenSale.createPropertySale(
  "Duna Residences Studio",
  "Roatán, Prospera ZEDE", 
  "prospera",
  119000 * 10**18, // $119,000 USD
  1190,            // 1,190 tokens  
  100 * 10**18,    // $100 per token
  30 days          // Sale duration
);
```

### Real Properties Supported
- **Duna Residences Studio**: $119,000 (1,190 tokens)
- **Pristine Bay Villa 1111**: $175,000 (1,750 tokens)
- **Las Verandas Villa**: $950,000 (9,500 tokens)
- **Duna Two Bedroom**: $239,500 (2,395 tokens)

## 📊 Revenue Model

- **Platform Fee**: 2.5% on token sales
- **Revenue Share**: 5% on rental income distribution
- **Gas Optimization**: Efficient batch operations
- **Scalable Architecture**: Multi-property support

## 🤝 Contributing

Built for **Fracta.city** - Democratizing real estate investment through blockchain technology.

## 📜 License

MIT License - see LICENSE file for details.

---

**🚀 Built with:**
- Hardhat
- OpenZeppelin
- TypeScript  
- Base Blockchain
- ERC-1404 Standard

**For questions or support, contact the Fracta.city team.**
